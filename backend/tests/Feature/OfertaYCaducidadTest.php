<?php

namespace Tests\Feature;

use App\Models\AccesoTutorial;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Tutorial;
use App\Models\User;
use App\Services\AltaDeCompra;
use App\Services\PasarelaPago;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OfertaYCaducidadTest extends TestCase
{
    use RefreshDatabase;

    /** Ventana real de la promoción: 19:00 del 08/09 a 19:00 del 09/09, hora de España. */
    private const INICIO = '2026-09-08 19:00:00';

    private const FIN = '2026-09-09 19:00:00';

    private function masterclass(array $extra = []): Tutorial
    {
        return Tutorial::create(array_merge([
            'titulo' => 'Masterclass de Automaquillaje',
            'precio' => 55.00,
            'precio_oferta' => 45.00,
            'stripe_price_id' => 'price_base',
            'stripe_price_id_oferta' => 'price_oferta',
            'oferta_inicio' => Carbon::parse(self::INICIO, 'Europe/Madrid')->utc(),
            'oferta_fin' => Carbon::parse(self::FIN, 'Europe/Madrid')->utc(),
            'duracion_acceso_meses' => 6,
            'video_url' => 'https://youtu.be/secreto',
            'activo' => true,
        ], $extra));
    }

    /** Sustituye la pasarela y captura el price que se le pasa a Stripe. */
    private function capturarPasarela(): object
    {
        $espia = new class
        {
            public array $prices = [];

            public ?string $email = null;
        };

        $this->app->bind(PasarelaPago::class, fn () => new class($espia) implements PasarelaPago
        {
            public function __construct(private object $espia) {}

            public function crearSesionCheckout(Pedido $pedido, Collection $tutoriales, string $emailCliente): string
            {
                $this->espia->prices = $tutoriales
                    ->map(fn (Tutorial $t) => $t->stripePriceIdEfectivo())
                    ->all();
                $this->espia->email = $emailCliente;

                return 'https://checkout.stripe.com/c/pay/test';
            }
        });

        return $espia;
    }

    // ─── Precio según la ventana de la oferta ────────────────────────

    public function test_antes_de_empezar_la_oferta_se_cobra_el_precio_base(): void
    {
        $this->travelTo(Carbon::parse('2026-09-08 18:59:00', 'Europe/Madrid'));

        $tutorial = $this->masterclass();

        $this->assertFalse($tutorial->tieneOfertaActiva());
        $this->assertSame('55.00', (string) $tutorial->precio_efectivo);
        $this->assertSame('price_base', $tutorial->stripePriceIdEfectivo());
    }

    public function test_dentro_de_la_ventana_se_cobra_la_oferta(): void
    {
        $this->travelTo(Carbon::parse('2026-09-09 10:00:00', 'Europe/Madrid'));

        $tutorial = $this->masterclass();

        $this->assertTrue($tutorial->tieneOfertaActiva());
        $this->assertSame('45.00', (string) $tutorial->precio_efectivo);
        $this->assertSame('price_oferta', $tutorial->stripePriceIdEfectivo());
    }

    public function test_al_cumplirse_las_24h_el_precio_sube_al_base(): void
    {
        // Exactamente las 19:00 del dia siguiente: la oferta ya ha terminado.
        $this->travelTo(Carbon::parse(self::FIN, 'Europe/Madrid'));

        $tutorial = $this->masterclass();

        $this->assertFalse($tutorial->tieneOfertaActiva());
        $this->assertSame('55.00', (string) $tutorial->precio_efectivo);
        $this->assertSame('price_base', $tutorial->stripePriceIdEfectivo());
    }

    public function test_stripe_recibe_el_price_de_la_oferta_durante_la_ventana(): void
    {
        $this->travelTo(Carbon::parse('2026-09-09 12:00:00', 'Europe/Madrid'));

        $espia = $this->capturarPasarela();
        $tutorial = $this->masterclass();
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/pedidos', ['tutoriales' => [$tutorial->id]])
            ->assertCreated();

        $this->assertSame(['price_oferta'], $espia->prices);
        $this->assertDatabaseHas('pedidos', ['total' => 45.00]);
    }

    public function test_stripe_recibe_el_price_base_cuando_la_oferta_ha_caducado(): void
    {
        $this->travelTo(Carbon::parse('2026-09-10 12:00:00', 'Europe/Madrid'));

        $espia = $this->capturarPasarela();
        $tutorial = $this->masterclass();
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/pedidos', ['tutoriales' => [$tutorial->id]])
            ->assertCreated();

        $this->assertSame(['price_base'], $espia->prices);
        $this->assertDatabaseHas('pedidos', ['total' => 55.00]);
    }

    public function test_el_catalogo_publico_expone_el_precio_vigente_y_no_los_ids_de_stripe(): void
    {
        $this->travelTo(Carbon::parse('2026-09-09 12:00:00', 'Europe/Madrid'));
        $this->masterclass();

        $respuesta = $this->getJson('/api/tutoriales')->assertOk();

        $curso = $respuesta->json('0');

        $this->assertSame('45.00', $curso['precio_efectivo']);
        $this->assertTrue($curso['oferta_activa']);
        $this->assertGreaterThan(0, $curso['oferta_segundos_restantes']);
        $this->assertSame(6, $curso['duracion_acceso_meses']);

        // Los identificadores de Stripe no deben salir en la API publica.
        $this->assertArrayNotHasKey('stripe_price_id', $curso);
        $this->assertArrayNotHasKey('stripe_price_id_oferta', $curso);
    }

    // ─── Compra sin cuenta ───────────────────────────────────────────

    public function test_invitado_puede_comprar_sin_cuenta_y_no_se_crea_usuario_hasta_pagar(): void
    {
        $espia = $this->capturarPasarela();
        $tutorial = $this->masterclass();

        $this->postJson('/api/pedidos', [
            'tutoriales' => [$tutorial->id],
            'nombre' => 'Ana Ruiz',
            'email' => 'ana@example.com',
        ])->assertCreated();

        $this->assertSame('ana@example.com', $espia->email);
        $this->assertDatabaseHas('pedidos', [
            'user_id' => null,
            'email_cliente' => 'ana@example.com',
            'nombre_cliente' => 'Ana Ruiz',
        ]);

        // Una compra abandonada no debe dejar la cuenta creada: si no, el
        // correo aparece como "ya registrado" al intentar registrarse.
        $this->assertDatabaseCount('users', 0);
    }

    public function test_invitado_sin_email_recibe_error_de_validacion(): void
    {
        $tutorial = $this->masterclass();

        $this->postJson('/api/pedidos', ['tutoriales' => [$tutorial->id]])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'nombre']);
    }

    public function test_al_confirmarse_el_pago_se_crea_la_cuenta_y_se_envia_el_justificante(): void
    {
        Mail::fake();

        $tutorial = $this->masterclass();

        $pedido = Pedido::create([
            'user_id' => null,
            'email_cliente' => 'ana@example.com',
            'nombre_cliente' => 'Ana Ruiz',
            'estado' => 'pendiente',
            'total' => 45.00,
            'metodo_pago' => 'stripe',
        ]);

        PedidoItem::create([
            'pedido_id' => $pedido->id,
            'tutorial_id' => $tutorial->id,
            'precio_unitario' => 45.00,
        ]);

        app(AltaDeCompra::class)->completar($pedido, 'pi_test_1');

        $this->assertDatabaseHas('users', ['email' => 'ana@example.com', 'name' => 'Ana Ruiz']);
        $this->assertDatabaseHas('pedidos', ['id' => $pedido->id, 'estado' => 'pagado']);

        $usuario = User::where('email', 'ana@example.com')->first();
        $this->assertDatabaseHas('accesos_tutorial', [
            'user_id' => $usuario->id,
            'tutorial_id' => $tutorial->id,
        ]);

        Mail::assertSent(\App\Mail\JustificanteCompra::class, function ($mail) {
            return $mail->hasTo('ana@example.com')
                && $mail->hasCc(config('mail.contacto_destino'))
                // Cuenta recien creada: tiene que llevar el enlace de contrasena.
                && $mail->enlacePassword !== null;
        });
    }

    public function test_si_la_cuenta_ya_existia_el_justificante_no_lleva_enlace_de_password(): void
    {
        Mail::fake();

        $tutorial = $this->masterclass();
        $usuario = User::factory()->create(['email' => 'ana@example.com']);

        $pedido = Pedido::create([
            'user_id' => null,
            'email_cliente' => 'ana@example.com',
            'nombre_cliente' => 'Ana Ruiz',
            'estado' => 'pendiente',
            'total' => 45.00,
            'metodo_pago' => 'stripe',
        ]);

        PedidoItem::create([
            'pedido_id' => $pedido->id,
            'tutorial_id' => $tutorial->id,
            'precio_unitario' => 45.00,
        ]);

        app(AltaDeCompra::class)->completar($pedido, 'pi_test_2');

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseHas('pedidos', ['id' => $pedido->id, 'user_id' => $usuario->id]);

        Mail::assertSent(
            \App\Mail\JustificanteCompra::class,
            fn ($mail) => $mail->enlacePassword === null
        );
    }

    // ─── Caducidad del acceso ───────────────────────────────────────

    public function test_la_compra_concede_seis_meses_de_acceso(): void
    {
        Mail::fake();
        $this->travelTo(Carbon::parse('2026-09-09 12:00:00', 'Europe/Madrid'));

        $tutorial = $this->masterclass();
        $user = User::factory()->create();

        $pedido = Pedido::create([
            'user_id' => $user->id,
            'estado' => 'pendiente',
            'total' => 45.00,
            'metodo_pago' => 'stripe',
        ]);

        PedidoItem::create([
            'pedido_id' => $pedido->id,
            'tutorial_id' => $tutorial->id,
            'precio_unitario' => 45.00,
        ]);

        app(AltaDeCompra::class)->completar($pedido, 'pi_test_3');

        $acceso = AccesoTutorial::where('user_id', $user->id)->firstOrFail();

        $this->assertNotNull($acceso->expira_en);
        $this->assertSame(
            now()->addMonths(6)->toDateString(),
            $acceso->expira_en->toDateString()
        );
    }

    public function test_un_acceso_caducado_deja_de_entregar_el_video(): void
    {
        $tutorial = $this->masterclass();
        $user = User::factory()->create();

        AccesoTutorial::create([
            'user_id' => $user->id,
            'tutorial_id' => $tutorial->id,
            'expira_en' => now()->subDay(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        // Ruta publica con Bearer token.
        $respuesta = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/tutoriales/'.$tutorial->id)
            ->assertOk();

        $this->assertArrayNotHasKey('video_url', $respuesta->json());

        // Y en mis-cursos aparece, pero marcado y sin enlace de video.
        $this->actingAs($user, 'sanctum')
            ->getJson('/api/mis-cursos')
            ->assertOk()
            ->assertJsonPath('0.acceso_vigente', false)
            ->assertJsonPath('0.video_url', null);
    }

    public function test_un_acceso_vigente_si_entrega_el_video_y_su_fecha_de_fin(): void
    {
        $tutorial = $this->masterclass();
        $user = User::factory()->create();

        AccesoTutorial::create([
            'user_id' => $user->id,
            'tutorial_id' => $tutorial->id,
            'expira_en' => now()->addMonths(6),
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/mis-cursos')
            ->assertOk()
            ->assertJsonPath('0.acceso_vigente', true)
            ->assertJsonPath('0.video_url', 'https://youtu.be/secreto')
            ->assertJsonPath('0.acceso_dias_restantes', fn ($dias) => $dias > 150);
    }

    public function test_los_accesos_antiguos_sin_caducidad_siguen_funcionando(): void
    {
        $tutorial = $this->masterclass();
        $user = User::factory()->create();

        // expira_en null = acceso concedido antes de introducir los 6 meses.
        AccesoTutorial::create([
            'user_id' => $user->id,
            'tutorial_id' => $tutorial->id,
            'expira_en' => null,
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/mis-cursos')
            ->assertOk()
            ->assertJsonPath('0.acceso_vigente', true)
            ->assertJsonPath('0.video_url', 'https://youtu.be/secreto');
    }

    public function test_no_se_puede_comprar_dos_veces_pero_si_renovar_lo_caducado(): void
    {
        $this->capturarPasarela();

        $tutorial = $this->masterclass();
        $user = User::factory()->create(['email' => 'ana@example.com']);

        $acceso = AccesoTutorial::create([
            'user_id' => $user->id,
            'tutorial_id' => $tutorial->id,
            'expira_en' => now()->addMonth(),
        ]);

        // Con acceso vigente no hay nada que pagar.
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/pedidos', ['tutoriales' => [$tutorial->id]])
            ->assertStatus(409);

        // Una vez caducado, sí debe poder volver a comprarlo.
        $acceso->update(['expira_en' => now()->subDay()]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/pedidos', ['tutoriales' => [$tutorial->id]])
            ->assertCreated();
    }

    // ─── Aviso de caducidad ─────────────────────────────────────────

    public function test_el_aviso_se_envia_una_sola_vez_y_solo_al_ultimo_mes(): void
    {
        Mail::fake();

        $tutorial = $this->masterclass();

        $proximo = User::factory()->create(['email' => 'proximo@example.com']);
        AccesoTutorial::create([
            'user_id' => $proximo->id,
            'tutorial_id' => $tutorial->id,
            'expira_en' => now()->addDays(20),
        ]);

        $lejano = User::factory()->create(['email' => 'lejano@example.com']);
        AccesoTutorial::create([
            'user_id' => $lejano->id,
            'tutorial_id' => $tutorial->id,
            'expira_en' => now()->addMonths(5),
        ]);

        $this->artisan('cursos:avisar-caducidad')->assertSuccessful();

        Mail::assertSent(\App\Mail\AccesoPorCaducar::class, 1);
        Mail::assertSent(
            \App\Mail\AccesoPorCaducar::class,
            fn ($mail) => $mail->hasTo('proximo@example.com')
        );

        // Segunda pasada del planificador: no debe repetir el aviso.
        $this->artisan('cursos:avisar-caducidad')->assertSuccessful();
        Mail::assertSent(\App\Mail\AccesoPorCaducar::class, 1);
    }

    public function test_el_aviso_no_se_envia_a_accesos_ya_caducados(): void
    {
        Mail::fake();

        $tutorial = $this->masterclass();
        $user = User::factory()->create();

        AccesoTutorial::create([
            'user_id' => $user->id,
            'tutorial_id' => $tutorial->id,
            'expira_en' => now()->subDays(3),
        ]);

        $this->artisan('cursos:avisar-caducidad')->assertSuccessful();

        Mail::assertNothingSent();
    }
}

<?php

namespace Tests\Feature;

use App\Models\AccesoTutorial;
use App\Models\Pedido;
use App\Models\Tutorial;
use App\Models\User;
use App\Services\PasarelaPago;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Tests\TestCase;

class PedidoTest extends TestCase
{
    use RefreshDatabase;

    private function tutorial(array $extra = []): Tutorial
    {
        return Tutorial::create(array_merge([
            'titulo' => 'Masterclass de Automaquillaje',
            'descripcion_corta' => 'Curso de prueba',
            'precio' => 45.00,
            'stripe_price_id' => 'price_test_123',
            'nivel' => 'basico',
            'activo' => true,
        ], $extra));
    }

    private function fingirPasarela(string $url = 'https://checkout.stripe.com/c/pay/test'): void
    {
        $this->app->bind(PasarelaPago::class, fn () => new class($url) implements PasarelaPago
        {
            public function __construct(private string $url) {}

            public function crearSesionCheckout(Pedido $pedido, Collection $tutoriales, string $emailCliente): string
            {
                return $this->url;
            }
        });
    }

    public function test_compra_crea_pedido_pendiente_y_devuelve_url_de_checkout(): void
    {
        $this->fingirPasarela();
        $user = User::factory()->create();
        $tutorial = $this->tutorial();

        $respuesta = $this->actingAs($user, 'sanctum')
            ->postJson('/api/pedidos', ['tutoriales' => [$tutorial->id]]);

        $respuesta->assertCreated()
            ->assertJsonPath('checkout_url', 'https://checkout.stripe.com/c/pay/test')
            ->assertJsonPath('pedido.estado', 'pendiente');

        $this->assertDatabaseHas('pedidos', ['user_id' => $user->id, 'estado' => 'pendiente', 'total' => 45.00]);
        $this->assertDatabaseHas('pedido_items', ['tutorial_id' => $tutorial->id, 'precio_unitario' => 45.00]);
    }

    public function test_tutorial_sin_stripe_price_id_devuelve_503_y_no_crea_pedido(): void
    {
        $this->fingirPasarela();
        $user = User::factory()->create();
        $tutorial = $this->tutorial(['stripe_price_id' => null]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/pedidos', ['tutoriales' => [$tutorial->id]])
            ->assertStatus(503);

        $this->assertDatabaseCount('pedidos', 0);
    }

    public function test_no_permite_comprar_dos_veces_el_mismo_curso(): void
    {
        $this->fingirPasarela();
        $user = User::factory()->create();
        $tutorial = $this->tutorial();

        AccesoTutorial::create(['user_id' => $user->id, 'tutorial_id' => $tutorial->id]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/pedidos', ['tutoriales' => [$tutorial->id]])
            ->assertStatus(409);

        $this->assertDatabaseCount('pedidos', 0);
    }

    public function test_si_la_pasarela_falla_el_pedido_queda_cancelado_no_pendiente(): void
    {
        $user = User::factory()->create();
        $tutorial = $this->tutorial();

        $this->app->bind(PasarelaPago::class, fn () => new class implements PasarelaPago
        {
            public function crearSesionCheckout(Pedido $pedido, Collection $tutoriales, string $emailCliente): string
            {
                throw new \RuntimeException('Stripe caido');
            }
        });

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/pedidos', ['tutoriales' => [$tutorial->id]])
            ->assertStatus(502);

        // Lo importante: no queda un pedido "pendiente" huerfano.
        $this->assertDatabaseHas('pedidos', ['user_id' => $user->id, 'estado' => 'cancelado']);
        $this->assertDatabaseMissing('pedidos', ['user_id' => $user->id, 'estado' => 'pendiente']);
    }

    public function test_solo_devuelve_los_pedidos_del_usuario_autenticado(): void
    {
        $ana = User::factory()->create();
        $otra = User::factory()->create();

        Pedido::create(['user_id' => $ana->id, 'estado' => 'pagado', 'total' => 45, 'metodo_pago' => 'stripe']);
        Pedido::create(['user_id' => $otra->id, 'estado' => 'pagado', 'total' => 45, 'metodo_pago' => 'stripe']);

        $this->actingAs($ana, 'sanctum')
            ->getJson('/api/pedidos')
            ->assertOk()
            ->assertJsonCount(1);
    }
}

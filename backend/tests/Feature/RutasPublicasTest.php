<?php

namespace Tests\Feature;

use App\Models\AccesoTutorial;
use App\Models\Categoria;
use App\Models\Servicio;
use App\Models\Tutorial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RutasPublicasTest extends TestCase
{
    use RefreshDatabase;

    private function tutorial(): Tutorial
    {
        return Tutorial::create([
            'titulo' => 'Masterclass',
            'precio' => 45.00,
            'video_url' => 'https://youtu.be/secreto',
            'activo' => true,
        ]);
    }

    public function test_el_listado_publico_nunca_expone_el_video(): void
    {
        $this->tutorial();

        $this->getJson('/api/tutoriales')
            ->assertOk()
            ->assertJsonMissing(['video_url' => 'https://youtu.be/secreto']);
    }

    public function test_visitante_anonimo_no_ve_el_video_de_un_tutorial(): void
    {
        $tutorial = $this->tutorial();

        $respuesta = $this->getJson('/api/tutoriales/'.$tutorial->id)->assertOk();

        $this->assertArrayNotHasKey('video_url', $respuesta->json());
    }

    /**
     * Regresion: la ruta es publica, asi que $request->user() usaba el guard
     * web (sesion) y devolvia null aunque llegase un Bearer token valido.
     * Resultado: quien habia comprado el curso nunca recibia el video.
     */
    public function test_comprador_con_bearer_token_si_ve_el_video_en_ruta_publica(): void
    {
        $tutorial = $this->tutorial();
        $user = User::factory()->create();
        AccesoTutorial::create(['user_id' => $user->id, 'tutorial_id' => $tutorial->id]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/tutoriales/'.$tutorial->id)
            ->assertOk()
            ->assertJsonPath('video_url', 'https://youtu.be/secreto');
    }

    public function test_la_resena_de_un_usuario_logueado_guarda_su_user_id(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/resenas', ['puntuacion' => 5, 'comentario' => 'Genial'])
            ->assertCreated();

        $this->assertDatabaseHas('resenas', ['user_id' => $user->id, 'puntuacion' => 5]);
    }

    public function test_la_cita_de_un_usuario_logueado_guarda_su_user_id(): void
    {
        Mail::fake();

        $categoria = Categoria::create(['nombre' => 'Novias', 'slug' => 'novias']);
        $servicio = Servicio::create([
            'categoria_id' => $categoria->id,
            'nombre' => 'Maquillaje de novia',
            'precio' => 250.00,
            'activo' => true,
        ]);

        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/citas', [
                'servicio_id' => $servicio->id,
                'fecha_hora' => now()->addWeek()->format('Y-m-d H:i:s'),
                'nombre_cliente' => 'Ana Ruiz',
                'email_cliente' => 'ana@example.com',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('citas', ['user_id' => $user->id, 'nombre_cliente' => 'Ana Ruiz']);
    }

    public function test_las_resenas_no_aprobadas_no_se_listan(): void
    {
        $this->postJson('/api/resenas', ['puntuacion' => 1, 'comentario' => 'spam'])->assertCreated();

        $this->getJson('/api/resenas')->assertOk()->assertJsonCount(0);
    }

    public function test_el_login_se_bloquea_tras_varios_intentos_fallidos(): void
    {
        User::factory()->create(['email' => 'ana@example.com']);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', [
                'email' => 'ana@example.com',
                'password' => 'incorrecta',
            ])->assertStatus(401);
        }

        // El sexto intento ya no llega al controlador.
        $this->postJson('/api/auth/login', [
            'email' => 'ana@example.com',
            'password' => 'incorrecta',
        ])->assertStatus(429);
    }
}

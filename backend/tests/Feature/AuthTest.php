<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_registro_crea_usuario_y_devuelve_token(): void
    {
        $respuesta = $this->postJson('/api/auth/register', [
            'nombre' => 'Ana Ruiz',
            'email' => 'ana@example.com',
            'telefono' => '600111222',
            'password' => 'secreto123',
            'password_confirmation' => 'secreto123',
        ]);

        $respuesta->assertCreated()
            ->assertJsonStructure(['message', 'user' => ['id', 'name', 'email'], 'token']);

        $this->assertDatabaseHas('users', [
            'email' => 'ana@example.com',
            'phone' => '600111222',
        ]);
    }

    public function test_registro_rechaza_email_duplicado(): void
    {
        User::factory()->create(['email' => 'ana@example.com']);

        $this->postJson('/api/auth/register', [
            'nombre' => 'Ana Ruiz',
            'email' => 'ana@example.com',
            'password' => 'secreto123',
            'password_confirmation' => 'secreto123',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_login_correcto_devuelve_token(): void
    {
        User::factory()->create([
            'email' => 'ana@example.com',
            'password' => Hash::make('secreto123'),
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'ana@example.com',
            'password' => 'secreto123',
        ])->assertOk()->assertJsonStructure(['token']);
    }

    public function test_login_incorrecto_devuelve_401(): void
    {
        User::factory()->create([
            'email' => 'ana@example.com',
            'password' => Hash::make('secreto123'),
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'ana@example.com',
            'password' => 'incorrecta',
        ])->assertStatus(401);
    }

    public function test_rutas_privadas_exigen_token(): void
    {
        $this->getJson('/api/mis-cursos')->assertStatus(401);
        $this->getJson('/api/pedidos')->assertStatus(401);
        $this->getJson('/api/citas')->assertStatus(401);
    }

    public function test_logout_invalida_el_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $this->assertDatabaseCount('personal_access_tokens', 1);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/auth/logout')
            ->assertOk();

        // Evidencia directa de que el logout revoco el token.
        $this->assertDatabaseCount('personal_access_tokens', 0);

        // Las dos peticiones de un mismo test comparten la instancia de la
        // aplicacion, y el guard de Sanctum se queda con el usuario que ya
        // resolvio en la llamada a /auth/logout. Sin descartar los guards,
        // la segunda peticion reutilizaria ese usuario cacheado y respondria
        // 200 aunque el token ya no exista en la base de datos.
        // En produccion cada peticion es un proceso nuevo y esto no pasa.
        Auth::forgetGuards();

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/mis-cursos')
            ->assertStatus(401);
    }

    public function test_forgot_password_no_revela_si_el_email_existe(): void
    {
        Notification::fake();

        $existente = $this->postJson('/api/auth/forgot-password', ['email' => 'nadie@example.com']);
        $existente->assertOk();

        User::factory()->create(['email' => 'ana@example.com']);
        $this->postJson('/api/auth/forgot-password', ['email' => 'ana@example.com'])
            ->assertOk()
            ->assertJson(['message' => $existente->json('message')]);
    }

    public function test_reset_password_cambia_la_clave_y_revoca_tokens(): void
    {
        $user = User::factory()->create(['email' => 'ana@example.com']);
        $tokenViejo = $user->createToken('auth_token')->plainTextToken;
        $tokenReset = Password::createToken($user);

        $this->postJson('/api/auth/reset-password', [
            'token' => $tokenReset,
            'email' => 'ana@example.com',
            'password' => 'nuevaClave123',
            'password_confirmation' => 'nuevaClave123',
        ])->assertOk();

        $this->postJson('/api/auth/login', [
            'email' => 'ana@example.com',
            'password' => 'nuevaClave123',
        ])->assertOk();

        // Igual que en el test de logout: hay que descartar los guards para
        // que la comprobacion mire de verdad la base de datos y no un
        // usuario cacheado de una peticion anterior del mismo test.
        Auth::forgetGuards();

        $this->withHeader('Authorization', 'Bearer '.$tokenViejo)
            ->getJson('/api/mis-cursos')
            ->assertStatus(401);
    }
}

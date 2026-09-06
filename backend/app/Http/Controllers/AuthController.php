<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'telefono' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.max' => 'El nombre no puede superar los 255 caracteres.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Introduce un correo electrónico válido.',
            'email.unique' => 'Ya existe una cuenta con este correo electrónico.',
            'telefono.max' => 'El teléfono no puede superar los 20 caracteres.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        $user = User::create([
            'name' => $validated['nombre'],
            'email' => $validated['email'],
            'phone' => $validated['telefono'] ?? null,
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Cuenta creada correctamente.',
            'user' => $this->datosPublicos($user),
            'token' => $this->emitirToken($user),
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Introduce un correo electrónico válido.',
            'password.required' => 'La contraseña es obligatoria.',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'El correo o la contraseña son incorrectos.',
            ], 401);
        }

        return response()->json([
            'message' => 'Sesión iniciada correctamente.',
            'user' => $this->datosPublicos($user),
            'token' => $this->emitirToken($user),
        ], 200);
    }

    // Permite al frontend comprobar que el token guardado sigue siendo valido
    // y refrescar los datos del usuario sin fiarse solo de localStorage.
    public function me(Request $request)
    {
        return response()->json([
            'user' => $this->datosPublicos($request->user()),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada'], 200);
    }

    /**
     * Envia el correo con el enlace de recuperacion.
     *
     * Responde siempre lo mismo exista o no la cuenta: si distinguiera
     * ambos casos, el endpoint serviria para enumerar emails registrados.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Introduce un correo electrónico válido.',
        ]);

        try {
            $status = Password::sendResetLink($request->only('email'));

            if ($status !== Password::RESET_LINK_SENT) {
                Log::info('Recuperacion de password no enviada', [
                    'status' => $status,
                    'email' => $request->input('email'),
                ]);
            }
        } catch (\Throwable $e) {
            // Un fallo de SMTP tampoco debe revelar si la cuenta existe.
            Log::error('Error enviando correo de recuperacion: '.$e->getMessage());
        }

        return response()->json([
            'message' => 'Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.',
        ], 200);
    }

    /**
     * Aplica la nueva password a partir del token recibido por correo.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|string|email',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'token.required' => 'El enlace de recuperación no es válido.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Si alguien habia robado un token, el cambio de contrasena
                // debe invalidarlo: revocamos todos los tokens existentes.
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => ['El enlace de recuperación no es válido o ha caducado. Solicita uno nuevo.'],
            ]);
        }

        return response()->json([
            'message' => 'Contraseña actualizada. Ya puedes iniciar sesión.',
        ], 200);
    }

    private function emitirToken(User $user): string
    {
        $expiracion = config('sanctum.expiration');

        return $user->createToken(
            'auth_token',
            ['*'],
            $expiracion ? now()->addMinutes((int) $expiracion) : null
        )->plainTextToken;
    }

    private function datosPublicos(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];
    }
}

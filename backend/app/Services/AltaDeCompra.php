<?php

namespace App\Services;

use App\Mail\JustificanteCompra;
use App\Models\AccesoTutorial;
use App\Models\Pedido;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

/**
 * Todo lo que pasa cuando un pago se confirma.
 *
 * Vive fuera del webhook para poder probarlo sin firmar payloads de Stripe
 * y para que el controlador siga siendo legible.
 */
class AltaDeCompra
{
    /**
     * Marca el pedido como pagado, da de alta la cuenta si hacia falta,
     * concede los accesos con su caducidad y envia el justificante.
     */
    public function completar(Pedido $pedido, ?string $referenciaPago = null): void
    {
        $cuentaNueva = false;

        DB::transaction(function () use ($pedido, $referenciaPago, &$cuentaNueva) {
            // Compra de invitado: la cuenta se crea ahora, con el pago ya
            // confirmado. El usuario es su propio correo.
            if ($pedido->user_id === null) {
                [$usuario, $cuentaNueva] = $this->cuentaPara($pedido);
                $pedido->user_id = $usuario->id;
            }

            $pedido->fill([
                'estado' => 'pagado',
                'referencia_pago' => $referenciaPago,
                'actualizado_en' => now(),
            ])->save();

            $pedido->load('items.tutorial');

            foreach ($pedido->items as $item) {
                $meses = $item->tutorial?->duracion_acceso_meses;

                AccesoTutorial::updateOrCreate(
                    [
                        'user_id' => $pedido->user_id,
                        'tutorial_id' => $item->tutorial_id,
                    ],
                    [
                        'pedido_id' => $pedido->id,
                        // null = sin caducidad. Se calcula desde ahora, que es
                        // el momento en que el acceso empieza de verdad.
                        'expira_en' => $meses ? now()->addMonths($meses) : null,
                        'aviso_expiracion_enviado_en' => null,
                    ]
                );
            }
        });

        Log::info('Pedido pagado y accesos concedidos', [
            'pedido_id' => $pedido->id,
            'cuenta_nueva' => $cuentaNueva,
        ]);

        $this->enviarJustificante($pedido->fresh(['items.tutorial', 'user']), $cuentaNueva);
    }

    /**
     * @return array{0: User, 1: bool} el usuario y si se acaba de crear
     */
    private function cuentaPara(Pedido $pedido): array
    {
        $usuario = User::where('email', $pedido->email_cliente)->first();

        if ($usuario) {
            return [$usuario, false];
        }

        $usuario = User::create([
            'name' => $pedido->nombre_cliente ?: 'Cliente',
            'email' => $pedido->email_cliente,
            // Contrasena aleatoria que nadie conoce: la persona recibe un
            // enlace para crear la suya. No se envian contrasenas por correo.
            'password' => Hash::make(Str::random(40)),
        ]);

        return [$usuario, true];
    }

    private function enviarJustificante(Pedido $pedido, bool $cuentaNueva): void
    {
        $destino = $pedido->emailContacto();

        if (! $destino) {
            Log::warning('Pedido sin correo de contacto: no se envia justificante', [
                'pedido_id' => $pedido->id,
            ]);

            return;
        }

        // Solo se genera el enlace de contrasena si la cuenta es nueva; a
        // quien ya tenia cuenta no hay que mandarle nada de eso.
        $enlacePassword = $cuentaNueva && $pedido->user
            ? $this->enlaceCrearPassword($pedido->user)
            : null;

        try {
            Mail::to($destino)
                ->cc(config('mail.contacto_destino'))
                ->send(new JustificanteCompra($pedido, $enlacePassword));
        } catch (\Throwable $e) {
            // El acceso al curso ya esta concedido: un fallo de SMTP no debe
            // deshacer la compra. Se registra para poder reenviarlo a mano.
            Log::error('Error enviando el justificante de compra', [
                'pedido_id' => $pedido->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function enlaceCrearPassword(User $usuario): string
    {
        $token = Password::createToken($usuario);

        return rtrim((string) config('app.frontend_url'), '/')
            .'/restablecer-password?token='.$token
            .'&email='.urlencode($usuario->email);
    }
}

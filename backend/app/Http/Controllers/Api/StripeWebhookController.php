<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccesoTutorial;
use App\Models\Pedido;
use App\Services\AltaDeCompra;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $webhookSecret = config('services.stripe.webhook_secret');

        if (empty($webhookSecret)) {
            // Sin secreto no se puede verificar la firma. Rechazar es mas
            // seguro que aceptar cualquier payload que llegue.
            Log::error('STRIPE_WEBHOOK_SECRET no configurado: webhook rechazado');

            return response()->json(['error' => 'Webhook no configurado'], 500);
        }

        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                (string) $request->header('Stripe-Signature'),
                $webhookSecret
            );
        } catch (SignatureVerificationException $e) {
            Log::warning('Webhook Stripe rechazado: firma invalida', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Firma invalida'], 400);
        } catch (\Throwable $e) {
            Log::warning('Webhook Stripe rechazado: payload invalido', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Payload invalido'], 400);
        }

        // Stripe reintenta la entrega hasta 3 dias. El insert sobre la columna
        // unica stripe_event_id nos da la idempotencia: si ya esta registrado,
        // devolvemos 200 sin volver a conceder accesos.
        try {
            DB::table('stripe_webhook_events')->insert([
                'stripe_event_id' => $event->id,
                'tipo' => $event->type,
                'procesado_en' => now(),
            ]);
        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
            Log::info('Webhook Stripe duplicado ignorado', ['event_id' => $event->id]);

            return response()->json(['status' => 'duplicado'], 200);
        }

        Log::info('Webhook Stripe recibido', ['type' => $event->type, 'event_id' => $event->id]);

        match ($event->type) {
            'checkout.session.completed' => $this->marcarPagado($event->data->object),
            'checkout.session.expired' => $this->cambiarEstado($event->data->object->client_reference_id, 'cancelado'),
            'charge.refunded' => $this->marcarReembolsado($event->data->object),
            default => null,
        };

        return response()->json(['status' => 'procesado'], 200);
    }

    private function marcarPagado(object $session): void
    {
        $pedido = Pedido::find($session->client_reference_id);

        if (! $pedido) {
            Log::warning('Webhook Stripe: pedido no encontrado', [
                'pedido_id' => $session->client_reference_id,
            ]);

            return;
        }

        // Dar de alta la cuenta si la compra fue de invitado, conceder los
        // accesos con su caducidad y enviar el justificante. Vive en
        // AltaDeCompra para poder probarlo sin firmar payloads de Stripe.
        app(AltaDeCompra::class)->completar($pedido, $session->payment_intent);
    }

    /**
     * Un reembolso debe retirar el acceso al curso; si no, se puede comprar,
     * pedir la devolucion y conservar el video igualmente.
     */
    private function marcarReembolsado(object $charge): void
    {
        $pedido = Pedido::where('referencia_pago', $charge->payment_intent)->first();

        if (! $pedido) {
            Log::warning('Webhook Stripe: reembolso sin pedido asociado', [
                'payment_intent' => $charge->payment_intent,
            ]);

            return;
        }

        DB::transaction(function () use ($pedido) {
            $pedido->update(['estado' => 'reembolsado', 'actualizado_en' => now()]);

            AccesoTutorial::where('pedido_id', $pedido->id)->delete();
        });

        Log::info('Pedido reembolsado y accesos retirados', ['pedido_id' => $pedido->id]);
    }

    private function cambiarEstado(?string $pedidoId, string $estado): void
    {
        if (! $pedidoId) {
            return;
        }

        Pedido::where('id', $pedidoId)
            ->where('estado', 'pendiente')
            ->update(['estado' => $estado, 'actualizado_en' => now()]);
    }
}

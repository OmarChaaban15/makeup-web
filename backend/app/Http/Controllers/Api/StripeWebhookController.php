<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\AccesoTutorial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (SignatureVerificationException $e) {
            Log::warning('Webhook Stripe rechazado: firma invalida', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Firma invalida'], 400);
        } catch (\Exception $e) {
            Log::warning('Webhook Stripe rechazado: payload invalido', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Payload invalido'], 400);
        }

        Log::info('Webhook Stripe recibido', ['type' => $event->type]);

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            $pedidoId = $session->client_reference_id;

            $pedido = Pedido::find($pedidoId);

            if (!$pedido) {
                Log::warning('Webhook Stripe: pedido no encontrado', ['pedido_id' => $pedidoId]);
                return response()->json(['status' => 'pedido_no_encontrado'], 200);
            }

            DB::transaction(function () use ($pedido, $session) {
                $pedido->update([
                    'estado'          => 'pagado',
                    'referencia_pago' => $session->payment_intent,
                ]);

                $items = PedidoItem::where('pedido_id', $pedido->id)->get();

                foreach ($items as $item) {
                    AccesoTutorial::firstOrCreate([
                        'user_id'     => $pedido->user_id,
                        'tutorial_id' => $item->tutorial_id,
                    ], [
                        'pedido_id' => $pedido->id,
                    ]);
                }
            });

            Log::info('Pedido marcado como pagado y accesos concedidos', ['pedido_id' => $pedido->id]);
        }

        return response()->json(['status' => 'procesado'], 200);
    }
}
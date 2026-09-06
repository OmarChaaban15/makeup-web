<?php

namespace App\Services;

use App\Models\Pedido;
use App\Models\Tutorial;
use Illuminate\Support\Collection;
use Stripe\StripeClient;

class StripePasarelaPago implements PasarelaPago
{
    public function __construct(private StripeClient $stripe) {}

    public function crearSesionCheckout(Pedido $pedido, Collection $tutoriales, string $emailCliente): string
    {
        $session = $this->stripe->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => $tutoriales->map(fn (Tutorial $tutorial) => [
                'price' => $tutorial->stripe_price_id,
                'quantity' => 1,
            ])->values()->all(),
            'success_url' => $this->urlFrontend('/pago-exitoso?pedido='.$pedido->id),
            'cancel_url' => $this->urlFrontend('/pago-cancelado?pedido='.$pedido->id),
            // Enlaza la sesion con nuestro pedido: es lo que lee el webhook.
            'client_reference_id' => (string) $pedido->id,
            'customer_email' => $emailCliente,
        ]);

        return $session->url;
    }

    private function urlFrontend(string $ruta): string
    {
        return rtrim((string) config('app.frontend_url'), '/').$ruta;
    }
}

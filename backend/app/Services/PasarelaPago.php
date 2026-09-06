<?php

namespace App\Services;

use App\Models\Pedido;
use Illuminate\Support\Collection;

/**
 * Abstraccion de la pasarela de pago.
 *
 * Existe para poder sustituirla en los tests: antes el controlador hacia
 * new StripeClient(...) directamente y no habia forma de probar la compra
 * sin llamar de verdad a la API de Stripe.
 */
interface PasarelaPago
{
    /**
     * Crea la sesion de pago y devuelve la URL a la que redirigir al cliente.
     *
     * @param  Collection<int, \App\Models\Tutorial>  $tutoriales
     */
    public function crearSesionCheckout(Pedido $pedido, Collection $tutoriales, string $emailCliente): string;
}

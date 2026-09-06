<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Tutorial;
use App\Services\PasarelaPago;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PedidoController extends Controller
{
    public function index(Request $request)
    {
        $pedidos = Pedido::with('items.tutorial')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('id')
            ->get();

        return response()->json($pedidos);
    }

    public function store(Request $request, PasarelaPago $pasarela)
    {
        $validated = $request->validate([
            'tutoriales' => 'required|array|min:1|max:20',
            'tutoriales.*' => 'integer|distinct|exists:tutoriales,id',
        ], [
            'tutoriales.required' => 'Selecciona al menos un curso.',
            'tutoriales.*.exists' => 'Alguno de los cursos seleccionados ya no está disponible.',
        ]);

        $tutoriales = Tutorial::whereIn('id', $validated['tutoriales'])
            ->where('activo', true)
            ->get();

        if ($tutoriales->count() !== count($validated['tutoriales'])) {
            throw ValidationException::withMessages([
                'tutoriales' => ['Alguno de los cursos seleccionados ya no está disponible.'],
            ]);
        }

        // Sin stripe_price_id la sesion de Checkout se crea con price=null y
        // Stripe devuelve un error generico. Mejor fallar aqui con un mensaje util.
        $sinPrecio = $tutoriales->whereNull('stripe_price_id');

        if ($sinPrecio->isNotEmpty()) {
            Log::error('Tutoriales sin stripe_price_id configurado', [
                'ids' => $sinPrecio->pluck('id')->all(),
            ]);

            return response()->json([
                'message' => 'Este curso no está disponible para la compra en este momento. Inténtalo más tarde.',
            ], 503);
        }

        // Evitamos cobrar dos veces por lo que el usuario ya tiene.
        $yaComprados = $tutoriales->filter(
            fn (Tutorial $tutorial) => $tutorial->accesos()
                ->where('user_id', $request->user()->id)
                ->exists()
        );

        if ($yaComprados->isNotEmpty()) {
            return response()->json([
                'message' => 'Ya tienes acceso a este curso. Lo encontrarás en "Mis cursos".',
            ], 409);
        }

        $pedido = DB::transaction(function () use ($request, $tutoriales) {
            $pedido = Pedido::create([
                'user_id' => $request->user()->id,
                'estado' => 'pendiente',
                'total' => $tutoriales->sum('precio'),
                'metodo_pago' => 'stripe',
            ]);

            foreach ($tutoriales as $tutorial) {
                PedidoItem::create([
                    'pedido_id' => $pedido->id,
                    'tutorial_id' => $tutorial->id,
                    'precio_unitario' => $tutorial->precio,
                ]);
            }

            return $pedido;
        });

        // La llamada a la pasarela va fuera de la transaccion (es I/O de red),
        // pero si falla hay que marcar el pedido como cancelado: antes se
        // quedaba colgado en "pendiente" y el usuario recibia un 500 pelado.
        try {
            $checkoutUrl = $pasarela->crearSesionCheckout(
                $pedido,
                $tutoriales,
                $request->user()->email
            );
        } catch (\Throwable $e) {
            $pedido->update(['estado' => 'cancelado', 'actualizado_en' => now()]);

            Log::error('Error creando la sesión de Stripe Checkout', [
                'pedido_id' => $pedido->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo iniciar el pago seguro. Inténtalo de nuevo en unos minutos.',
            ], 502);
        }

        return response()->json([
            'pedido' => $pedido,
            'checkout_url' => $checkoutUrl,
        ], 201);
    }
}

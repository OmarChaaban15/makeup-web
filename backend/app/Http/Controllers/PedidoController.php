<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Tutorial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Stripe\StripeClient;

class PedidoController extends Controller
{
    public function index(Request $request)
    {
        $pedidos = Pedido::with('items.tutorial')
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json($pedidos);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tutoriales' => 'required|array|min:1',
            'tutoriales.*' => 'exists:tutoriales,id',
        ]);

        $pedido = DB::transaction(function () use ($request) {
            $tutoriales = Tutorial::whereIn('id', $request->tutoriales)->get();
            $total = $tutoriales->sum('precio');

            $pedido = Pedido::create([
                'user_id'     => $request->user()->id,
                'estado'      => 'pendiente',
                'total'       => $total,
                'metodo_pago' => 'stripe',
            ]);

            foreach ($tutoriales as $tutorial) {
                PedidoItem::create([
                    'pedido_id'       => $pedido->id,
                    'tutorial_id'     => $tutorial->id,
                    'precio_unitario' => $tutorial->precio,
                ]);
            }

            return $pedido;
        });

        // Construimos los "line items" de Stripe a partir de los tutoriales comprados
        $tutoriales = Tutorial::whereIn('id', $request->tutoriales)->get();

        $lineItems = $tutoriales->map(function ($tutorial) {
            return [
                'price'    => $tutorial->stripe_price_id,
                'quantity' => 1,
            ];
        })->values()->all();

        $stripe = new StripeClient(config('services.stripe.secret'));

        $session = $stripe->checkout->sessions->create([
            'mode'                => 'payment',
            'line_items'          => $lineItems,
            'success_url'         => config('app.frontend_url') . '/pago-exitoso?pedido=' . $pedido->id,
            'cancel_url'          => config('app.frontend_url') . '/pago-cancelado?pedido=' . $pedido->id,
            'client_reference_id' => $pedido->id,
        ]);

        return response()->json([
            'pedido'       => $pedido,
            'checkout_url' => $session->url,
        ], 201);
    }
}
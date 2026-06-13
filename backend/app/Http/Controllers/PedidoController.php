<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\AccesoTutorial;
use App\Models\Tutorial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PedidoController extends Controller
{
    // Lista los pedidos del usuario logueado
    public function index(Request $request)
    {
        $pedidos = Pedido::with('items.tutorial')
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json($pedidos);
    }

    // Crea un nuevo pedido con sus tutoriales
    public function store(Request $request)
    {
        $request->validate([
            'tutoriales' => 'required|array|min:1',
            'tutoriales.*' => 'exists:tutoriales,id',
        ]);

        DB::transaction(function () use ($request) {
            $tutoriales = Tutorial::whereIn('id', $request->tutoriales)->get();
            $total = $tutoriales->sum('precio');

            $pedido = Pedido::create([
                'user_id' => $request->user()->id,
                'estado'  => 'pendiente',
                'total'   => $total,
            ]);

            foreach ($tutoriales as $tutorial) {
                PedidoItem::create([
                    'pedido_id'       => $pedido->id,
                    'tutorial_id'     => $tutorial->id,
                    'precio_unitario' => $tutorial->precio,
                ]);
            }

            return response()->json($pedido, 201);
        });
    }
}
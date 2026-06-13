<?php

namespace App\Http\Controllers;

use App\Models\Resena;
use Illuminate\Http\Request;

class ResenaController extends Controller
{
    // Devuelve reseñas aprobadas de un servicio o tutorial
    public function index(Request $request)
    {
        $query = Resena::where('aprobada', true)->with('user');

        if ($request->servicio_id) {
            $query->where('servicio_id', $request->servicio_id);
        }

        if ($request->tutorial_id) {
            $query->where('tutorial_id', $request->tutorial_id);
        }

        return response()->json($query->get());
    }

    // Crea una reseña
    public function store(Request $request)
    {
        $request->validate([
            'puntuacion'  => 'required|integer|min:1|max:5',
            'comentario'  => 'nullable|string',
            'servicio_id' => 'nullable|exists:servicios,id',
            'tutorial_id' => 'nullable|exists:tutoriales,id',
        ]);

        $resena = Resena::create([
            'user_id'     => $request->user()?->id,
            'servicio_id' => $request->servicio_id,
            'tutorial_id' => $request->tutorial_id,
            'puntuacion'  => $request->puntuacion,
            'comentario'  => $request->comentario,
            'aprobada'    => false,
        ]);

        return response()->json($resena, 201);
    }
}
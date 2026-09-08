<?php

namespace App\Http\Controllers;

use App\Models\Resena;
use Illuminate\Http\Request;

class ResenaController extends Controller
{
    // Devuelve resenas aprobadas de un servicio o tutorial
    public function index(Request $request)
    {
        $request->validate([
            'servicio_id' => 'nullable|integer',
            'tutorial_id' => 'nullable|integer',
        ]);

        $query = Resena::where('aprobada', true)->with('user:id,name');

        if ($request->filled('servicio_id')) {
            $query->where('servicio_id', $request->integer('servicio_id'));
        }

        if ($request->filled('tutorial_id')) {
            $query->where('tutorial_id', $request->integer('tutorial_id'));
        }

        return response()->json($query->orderByDesc('id')->get());
    }

    // Crea una resena (queda pendiente de aprobacion manual)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'puntuacion' => 'required|integer|min:1|max:5',
            'comentario' => 'nullable|string|max:2000',
            'servicio_id' => 'nullable|exists:servicios,id',
            'tutorial_id' => 'nullable|exists:tutoriales,id',
        ], [
            'puntuacion.required' => 'La puntuación es obligatoria.',
            'puntuacion.min' => 'La puntuación debe estar entre 1 y 5.',
            'puntuacion.max' => 'La puntuación debe estar entre 1 y 5.',
        ]);

        // Ruta publica: hay que pedir el guard sanctum de forma explicita,
        // porque $request->user() resolveria el guard web (sesion) y seria
        // siempre null aunque el visitante tenga sesion iniciada.
        $usuario = $request->user() ?? auth('sanctum')->user();

        $resena = Resena::create([
            'user_id' => $usuario?->id,
            'servicio_id' => $validated['servicio_id'] ?? null,
            'tutorial_id' => $validated['tutorial_id'] ?? null,
            'puntuacion' => $validated['puntuacion'],
            'comentario' => $validated['comentario'] ?? null,
            'aprobada' => false,
        ]);

        return response()->json($resena, 201);
    }
}

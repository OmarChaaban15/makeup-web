<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    // Devuelve todas las categorías
    public function index()
    {
        return response()->json(Categoria::all());
    }

    // Devuelve una categoría con sus servicios y tutoriales
    public function show($id)
    {
        $categoria = Categoria::with(['servicios', 'tutoriales'])->findOrFail($id);
        return response()->json($categoria);
    }
}
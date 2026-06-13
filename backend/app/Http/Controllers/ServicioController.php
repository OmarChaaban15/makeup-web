<?php

namespace App\Http\Controllers;

use App\Models\Servicio;
use Illuminate\Http\Request;

class ServicioController extends Controller
{
    // Devuelve todos los servicios activos
    public function index()
    {
        return response()->json(Servicio::where('activo', true)->get());
    }

    // Devuelve un servicio concreto
    public function show($id)
    {
        $servicio = Servicio::with('categoria')->findOrFail($id);
        return response()->json($servicio);
    }
}
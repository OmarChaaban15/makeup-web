<?php

namespace App\Http\Controllers;

use App\Models\AccesoTutorial;
use Illuminate\Http\Request;

class AccesoTutorialController extends Controller
{
    // Devuelve los tutoriales a los que tiene acceso el usuario
    public function index(Request $request)
    {
        $accesos = AccesoTutorial::with('tutorial')
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json($accesos);
    }
}
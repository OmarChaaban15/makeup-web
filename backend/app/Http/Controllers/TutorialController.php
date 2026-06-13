<?php

namespace App\Http\Controllers;

use App\Models\Tutorial;
use App\Models\AccesoTutorial;
use Illuminate\Http\Request;

class TutorialController extends Controller
{
    // Devuelve todos los tutoriales activos (sin video_url)
    public function index()
    {
        return response()->json(Tutorial::where('activo', true)->get());
    }

    // Devuelve un tutorial. Si el usuario lo compró, incluye el video
    public function show(Request $request, $id)
    {
        $tutorial = Tutorial::findOrFail($id);

        $tieneAcceso = false;

        if ($request->user()) {
            $tieneAcceso = AccesoTutorial::where('user_id', $request->user()->id)
                ->where('tutorial_id', $id)
                ->exists();
        }

        if ($tieneAcceso) {
            $tutorial->makeVisible('video_url');
        }

        return response()->json($tutorial);
    }
}
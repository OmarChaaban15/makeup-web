<?php

namespace App\Http\Controllers;

use App\Models\Tutorial;
use Illuminate\Http\Request;

class AccesoTutorialController extends Controller
{
    // Devuelve los cursos (tutoriales) a los que tiene acceso el usuario
    // autenticado, incluyendo el video_url para poder reproducirlos.
    public function index(Request $request)
    {
        $tutoriales = Tutorial::whereIn('id', function ($query) use ($request) {
            $query->select('tutorial_id')
                ->from('accesos_tutorial')
                ->where('user_id', $request->user()->id);
        })
            ->with('categoria')
            ->get()
            ->makeVisible('video_url');

        return response()->json($tutoriales);
    }
}
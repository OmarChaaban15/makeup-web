<?php

namespace App\Http\Controllers;

use App\Models\Tutorial;
use Illuminate\Http\Request;

class AccesoTutorialController extends Controller
{
    /**
     * Cursos a los que tiene acceso el usuario autenticado, con el video_url
     * visible para poder reproducirlos.
     *
     * No se filtra por activo: si un curso se retira del catalogo, quien ya
     * lo compro debe seguir viendolo.
     */
    public function index(Request $request)
    {
        $tutoriales = Tutorial::query()
            ->whereHas('accesos', fn ($query) => $query->where('user_id', $request->user()->id))
            ->with('categoria')
            ->orderBy('titulo')
            ->get()
            ->makeVisible('video_url');

        return response()->json($tutoriales);
    }
}

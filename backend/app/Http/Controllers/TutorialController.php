<?php

namespace App\Http\Controllers;

use App\Models\AccesoTutorial;
use App\Models\Tutorial;
use Illuminate\Http\Request;

class TutorialController extends Controller
{
    // Devuelve todos los tutoriales activos (sin video_url)
    public function index()
    {
        return response()->json(
            Tutorial::where('activo', true)->with('categoria')->get()
        );
    }

    // Devuelve un tutorial. Si el usuario lo compro, incluye el video.
    public function show(Request $request, $id)
    {
        $tutorial = Tutorial::with('categoria')->findOrFail($id);

        // Ojo: esta ruta es publica, asi que NO pasa por auth:sanctum.
        // $request->user() resolveria el guard por defecto (web/sesion) y
        // devolveria null siempre, aunque llegue un Bearer token valido.
        // Hay que pedir el guard sanctum de forma explicita.
        $usuario = $request->user() ?? auth('sanctum')->user();

        // vigentes() excluye los accesos ya caducados: pasados los 6 meses,
        // el video deja de entregarse.
        $tieneAcceso = $usuario && AccesoTutorial::query()
            ->vigentes()
            ->where('user_id', $usuario->id)
            ->where('tutorial_id', $tutorial->id)
            ->exists();

        if ($tieneAcceso) {
            $tutorial->makeVisible('video_url');
        }

        return response()->json($tutorial);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\AccesoTutorial;
use Illuminate\Http\Request;

class AccesoTutorialController extends Controller
{
    /**
     * Cursos del usuario autenticado, con el video visible para poder
     * reproducirlos.
     *
     * Devuelve tambien los caducados, marcados como tal: es mas honesto que
     * hacerlos desaparecer sin explicacion, y permite ofrecer la renovacion.
     * El video solo se adjunta a los que siguen vigentes.
     *
     * No se filtra por "activo": si un curso se retira del catalogo, quien lo
     * compro debe seguir viendolo hasta que le caduque.
     */
    public function index(Request $request)
    {
        $accesos = AccesoTutorial::query()
            ->with(['tutorial.categoria'])
            ->where('user_id', $request->user()->id)
            ->get()
            ->filter(fn (AccesoTutorial $acceso) => $acceso->tutorial !== null)
            ->sortBy(fn (AccesoTutorial $acceso) => $acceso->tutorial->titulo)
            ->values();

        $cursos = $accesos->map(function (AccesoTutorial $acceso) {
            $vigente = $acceso->estaVigente();

            $tutorial = $acceso->tutorial;

            if ($vigente) {
                $tutorial->makeVisible('video_url');
            }

            return array_merge($tutorial->toArray(), [
                'acceso_vigente' => $vigente,
                'acceso_expira_en' => $acceso->expira_en,
                'acceso_dias_restantes' => $acceso->diasRestantes(),
                // Sin acceso vigente no se manda el enlace del video, ni
                // siquiera oculto en el JSON.
                'video_url' => $vigente ? $tutorial->video_url : null,
            ]);
        });

        return response()->json($cursos);
    }
}

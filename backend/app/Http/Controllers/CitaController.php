<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\CitaReservada;

class CitaController extends Controller
{
    // Lista las citas del usuario logueado
    public function index(Request $request)
    {
        $citas = Cita::with('servicio')
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json($citas);
    }

    // Crea una nueva cita
    public function store(Request $request)
    {
        $request->validate([
            'servicio_id'     => 'required|exists:servicios,id',
            'fecha_hora'      => 'required|date|after:now',
            'nombre_cliente'  => 'required|string|max:100',
            'email_cliente'   => 'required|email',
            'telefono_cliente'=> 'nullable|string|max:20',
            'notas'           => 'nullable|string',
        ]);

        $cita = Cita::create([
            'user_id'          => $request->user()?->id,
            'servicio_id'      => $request->servicio_id,
            'fecha_hora'       => $request->fecha_hora,
            'nombre_cliente'   => $request->nombre_cliente,
            'email_cliente'    => $request->email_cliente,
            'telefono_cliente' => $request->telefono_cliente,
            'notas'            => $request->notas,
            'estado'           => 'pendiente',
        ]);

        // Enviar email de notificación
        try {
            Mail::to('info@makeupbyyona.com')->send(new CitaReservada($cita));
        } catch (\Exception $e) {
            \Log::error('Error enviando email de cita: ' . $e->getMessage());
        }

        return response()->json($cita, 201);
    }

    // Cancela una cita
    public function cancelar($id)
    {
        $cita = Cita::findOrFail($id);
        $cita->update(['estado' => 'cancelada']);
        return response()->json(['mensaje' => 'Cita cancelada']);
    }
}
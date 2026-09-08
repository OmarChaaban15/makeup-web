<?php

namespace App\Http\Controllers;

use App\Mail\CitaReservada;
use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CitaController extends Controller
{
    // Lista las citas del usuario logueado
    public function index(Request $request)
    {
        $citas = Cita::with('servicio')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('fecha_hora')
            ->get();

        return response()->json($citas);
    }

    // Crea una nueva cita (ruta publica: se puede reservar sin cuenta)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'servicio_id' => 'required|exists:servicios,id',
            'fecha_hora' => 'required|date|after:now',
            'nombre_cliente' => 'required|string|max:100',
            'email_cliente' => 'required|email|max:180',
            'telefono_cliente' => 'nullable|string|max:20',
            'notas' => 'nullable|string|max:2000',
        ], [
            'servicio_id.required' => 'Selecciona un servicio.',
            'fecha_hora.after' => 'La fecha de la cita debe ser posterior a este momento.',
            'nombre_cliente.required' => 'El nombre es obligatorio.',
            'email_cliente.required' => 'El correo electrónico es obligatorio.',
        ]);

        // La ruta es publica, asi que $request->user() usaria el guard web
        // (sesion) y devolveria null aunque llegue un Bearer token. Pedimos
        // el guard sanctum para poder asociar la cita a su cuenta.
        $usuario = $request->user() ?? auth('sanctum')->user();

        $cita = Cita::create([
            'user_id' => $usuario?->id,
            'servicio_id' => $validated['servicio_id'],
            'fecha_hora' => $validated['fecha_hora'],
            'nombre_cliente' => $validated['nombre_cliente'],
            'email_cliente' => $validated['email_cliente'],
            'telefono_cliente' => $validated['telefono_cliente'] ?? null,
            'notas' => $validated['notas'] ?? null,
            'estado' => 'pendiente',
        ]);

        // El aviso por correo no debe tumbar la reserva si el SMTP falla.
        try {
            Mail::to(config('mail.contacto_destino'))->send(new CitaReservada($cita));
        } catch (\Throwable $e) {
            Log::error('Error enviando email de cita: '.$e->getMessage());
        }

        return response()->json($cita, 201);
    }
}

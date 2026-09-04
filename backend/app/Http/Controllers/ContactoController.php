<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\MensajeContacto;

class ContactoController extends Controller
{
    public function enviar(Request $request)
    {
        $validated = $request->validate([
            'nombre'       => 'required|string|max:100',
            'email'        => 'required|email|max:150',
            'telefono'     => 'nullable|string|max:30',
            'servicio'     => 'nullable|string|max:100',
            'fecha_evento' => 'nullable|string|max:50',
            'mensaje'      => 'required|string|max:3000',
        ]);

        try {
            Mail::to('info@makeupbyyona.com')->send(new MensajeContacto($validated));
        } catch (\Exception $e) {
            Log::error('Error enviando correo de contacto: ' . $e->getMessage());
            // No bloqueamos al usuario si el servidor SMTP local no está configurado,
            // pero dejamos el log registrado
        }

        return response()->json([
            'mensaje' => '¡Tu mensaje ha sido enviado correctamente! Te responderé lo antes posible.'
        ], 200);
    }
}

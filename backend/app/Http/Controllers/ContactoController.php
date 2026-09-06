<?php

namespace App\Http\Controllers;

use App\Mail\MensajeContacto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactoController extends Controller
{
    public function enviar(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'email' => 'required|email|max:150',
            'telefono' => 'nullable|string|max:30',
            'servicio' => 'nullable|string|max:100',
            'fecha_evento' => 'nullable|string|max:50',
            'mensaje' => 'required|string|max:3000',
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Introduce un correo electrónico válido.',
            'mensaje.required' => 'Escribe tu mensaje.',
        ]);

        try {
            Mail::to(config('mail.contacto_destino'))->send(new MensajeContacto($validated));
        } catch (\Throwable $e) {
            Log::error('Error enviando correo de contacto: '.$e->getMessage());

            // En produccion, si el correo no sale el mensaje se pierde: hay que
            // decirlo para que la persona use WhatsApp o el email directo.
            if (! app()->environment('local')) {
                return response()->json([
                    'mensaje' => 'No hemos podido enviar tu mensaje. Escríbenos por WhatsApp o a info@makeupbyyona.com.',
                ], 502);
            }
        }

        return response()->json([
            'mensaje' => '¡Tu mensaje ha sido enviado correctamente! Te responderé lo antes posible.',
        ], 200);
    }
}

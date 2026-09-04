<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MensajeContacto extends Mailable
{
    use Queueable, SerializesModels;

    public array $datos;

    /**
     * Create a new message instance.
     */
    public function __construct(array $datos)
    {
        $this->datos = $datos;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $nombre = $this->datos['nombre'] ?? 'Cliente Web';
        $servicio = $this->datos['servicio'] ?? 'Consulta';
        return new Envelope(
            subject: "Nueva consulta web de {$nombre} - [{$servicio}]",
            replyTo: [
                new \Illuminate\Mail\Mailables\Address($this->datos['email'], $nombre)
            ]
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $nombre = htmlspecialchars($this->datos['nombre'] ?? '');
        $email = htmlspecialchars($this->datos['email'] ?? '');
        $telefono = htmlspecialchars($this->datos['telefono'] ?? 'No indicado');
        $servicio = htmlspecialchars($this->datos['servicio'] ?? 'General');
        $fecha = htmlspecialchars($this->datos['fecha_evento'] ?? 'Por definir');
        $mensaje = nl2br(htmlspecialchars($this->datos['mensaje'] ?? ''));

        $html = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaded5; border-radius: 12px; background-color: #faf8f6;'>
                <h2 style='color: #c4956a; border-bottom: 2px solid #c4956a; padding-bottom: 10px; font-weight: normal; margin-top: 0;'>Nueva Consulta desde la Web</h2>
                <p style='color: #444; font-size: 15px;'>Has recibido un nuevo mensaje de una persona interesada en tus servicios:</p>
                <div style='background-color: #ffffff; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;'>
                    <p style='margin: 8px 0;'><strong>Nombre:</strong> {$nombre}</p>
                    <p style='margin: 8px 0;'><strong>Email:</strong> <a href='mailto:{$email}' style='color: #c4956a;'>{$email}</a></p>
                    <p style='margin: 8px 0;'><strong>Teléfono:</strong> {$telefono}</p>
                    <p style='margin: 8px 0;'><strong>Servicio de interés:</strong> {$servicio}</p>
                    <p style='margin: 8px 0;'><strong>Fecha aproximada / Evento:</strong> {$fecha}</p>
                </div>
                <h3 style='color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;'>Mensaje o detalles:</h3>
                <div style='background-color: #ffffff; padding: 18px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #333; border: 1px solid #eee;'>
                    {$mensaje}
                </div>
                <p style='color: #888; font-size: 12px; margin-top: 25px; text-align: center;'>Makeup By Yona &middot; Atelier de Maquillaje en Ibiza</p>
            </div>
        ";

        return new Content(
            htmlString: $html,
        );
    }
}

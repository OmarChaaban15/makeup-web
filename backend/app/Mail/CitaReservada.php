<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CitaReservada extends Mailable
{
    use Queueable, SerializesModels;

    public $cita;

    /**
     * Create a new message instance.
     */
    public function __construct(\App\Models\Cita $cita)
    {
        $this->cita = $cita;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nueva Reserva de Cita: ' . $this->cita->nombre_cliente,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $fecha = \Carbon\Carbon::parse($this->cita->fecha_hora)->format('d/m/Y H:i');
        
        $html = "
            <h2>Nueva Cita Reservada</h2>
            <p>Se ha reservado una nueva cita a través de la web:</p>
            <ul>
                <li><strong>Nombre:</strong> {$this->cita->nombre_cliente}</li>
                <li><strong>Email:</strong> {$this->cita->email_cliente}</li>
                <li><strong>Teléfono:</strong> {$this->cita->telefono_cliente}</li>
                <li><strong>Fecha y Hora:</strong> {$fecha}</li>
                <li><strong>Servicio ID:</strong> {$this->cita->servicio_id}</li>
                <li><strong>Notas:</strong> {$this->cita->notas}</li>
            </ul>
            <p>Por favor, contacta con el cliente para confirmar la cita si es necesario.</p>
        ";

        return new Content(
            htmlString: $html,
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

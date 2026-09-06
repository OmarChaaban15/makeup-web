<?php

namespace App\Mail;

use App\Models\Cita;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CitaReservada extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Cita $cita) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            // El asunto tambien lleva datos del formulario: sin sanear, un
            // salto de linea aqui permitiria inyectar cabeceras en el correo.
            subject: 'Nueva reserva de cita: '.$this->limpiar($this->cita->nombre_cliente),
            replyTo: filter_var($this->cita->email_cliente, FILTER_VALIDATE_EMAIL)
                ? [new Address($this->cita->email_cliente, $this->limpiar($this->cita->nombre_cliente))]
                : [],
        );
    }

    public function content(): Content
    {
        $fecha = \Carbon\Carbon::parse($this->cita->fecha_hora)->format('d/m/Y H:i');

        // Todos los campos vienen de un formulario publico: hay que escaparlos
        // antes de interpolarlos en el HTML del correo.
        $nombre = e($this->cita->nombre_cliente);
        $email = e($this->cita->email_cliente);
        $telefono = e($this->cita->telefono_cliente ?: 'No indicado');
        $servicio = e((string) $this->cita->servicio_id);
        $notas = nl2br(e($this->cita->notas ?: 'Sin notas'));

        $html = <<<HTML
            <h2>Nueva cita reservada</h2>
            <p>Se ha reservado una nueva cita a traves de la web:</p>
            <ul>
                <li><strong>Nombre:</strong> {$nombre}</li>
                <li><strong>Email:</strong> {$email}</li>
                <li><strong>Telefono:</strong> {$telefono}</li>
                <li><strong>Fecha y hora:</strong> {$fecha}</li>
                <li><strong>Servicio ID:</strong> {$servicio}</li>
                <li><strong>Notas:</strong> {$notas}</li>
            </ul>
            <p>Contacta con el cliente para confirmar la cita si es necesario.</p>
            HTML;

        return new Content(htmlString: $html);
    }

    public function attachments(): array
    {
        return [];
    }

    private function limpiar(?string $valor): string
    {
        return trim(preg_replace('/[\r\n]+/', ' ', (string) $valor));
    }
}

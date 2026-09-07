<?php

namespace App\Mail;

use App\Models\AccesoTutorial;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Aviso que se envia cuando queda aproximadamente un mes para que caduque
 * el acceso a un curso. Lo dispara el comando cursos:avisar-caducidad.
 */
class AccesoPorCaducar extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public AccesoTutorial $acceso) {}

    public function envelope(): Envelope
    {
        $titulo = $this->acceso->tutorial?->titulo ?? 'tu curso';

        return new Envelope(
            subject: 'Tu acceso a '.$this->limpiar($titulo).' caduca pronto',
        );
    }

    public function content(): Content
    {
        $nombre = e($this->acceso->user?->name ?? 'Hola');
        $titulo = e($this->acceso->tutorial?->titulo ?? 'tu curso');
        $fecha = e(
            \Carbon\Carbon::parse($this->acceso->expira_en)
                ->setTimezone('Europe/Madrid')
                ->format('d/m/Y')
        );
        $dias = (int) $this->acceso->diasRestantes();
        $cursos = e(rtrim((string) config('app.frontend_url'), '/').'/mis-cursos');

        $html = <<<HTML
            <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background-color: #faf8f6; border: 1px solid #eaded5; border-radius: 12px;">

                <h2 style="color: #c4956a; border-bottom: 2px solid #c4956a; padding-bottom: 10px; font-weight: normal; margin-top: 0;">
                    Te queda un mes de acceso
                </h2>

                <p style="color: #444; font-size: 15px;">Hola {$nombre},</p>

                <p style="color: #444; font-size: 15px; line-height: 1.7;">
                    Tu acceso a <strong>{$titulo}</strong> termina el
                    <strong>{$fecha}</strong> (quedan {$dias} días).
                </p>

                <p style="color: #444; font-size: 15px; line-height: 1.7;">
                    Si te queda alguna lección por ver o quieres repasar alguna
                    técnica, este es un buen momento.
                </p>

                <p style="margin: 24px 0;">
                    <a href="{$cursos}" style="display: inline-block; background-color: #c4956a; color: #ffffff; text-decoration: none; padding: 12px 26px; border-radius: 999px; font-size: 13px; font-weight: bold;">
                        Ir a mis cursos
                    </a>
                </p>

                <p style="color: #888; font-size: 12px; margin-top: 28px; text-align: center;">
                    Makeup by Yona &middot; Atelier de Maquillaje en Ibiza<br>
                    Si quieres ampliar tu acceso, responde a este correo.
                </p>
            </div>
            HTML;

        return new Content(htmlString: $html);
    }

    private function limpiar(?string $valor): string
    {
        return trim(preg_replace('/[\r\n]+/', ' ', (string) $valor));
    }
}

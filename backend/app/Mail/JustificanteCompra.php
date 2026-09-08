<?php

namespace App\Mail;

use App\Models\AccesoTutorial;
use App\Models\Pedido;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Justificante de compra que recibe el cliente, con copia al buzon del
 * negocio. No es una factura fiscal: no lleva numeracion correlativa ni
 * desglose de IVA (ver deploy/README.md).
 */
class JustificanteCompra extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Pedido $pedido,
        public ?string $enlacePassword = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tu compra · Makeup by Yona (pedido #'.$this->pedido->id.')',
        );
    }

    public function content(): Content
    {
        return new Content(htmlString: $this->cuerpoHtml());
    }

    private function cuerpoHtml(): string
    {
        $nombre = e($this->pedido->nombreContacto());
        $numero = e((string) $this->pedido->id);
        $fecha = e($this->enHoraLocal($this->pedido->creado_en));
        $total = e($this->importe($this->pedido->total));
        $referencia = e($this->pedido->referencia_pago ?: 'Stripe');

        return <<<HTML
            <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background-color: #faf8f6; border: 1px solid #eaded5; border-radius: 12px;">

                <h2 style="color: #c4956a; border-bottom: 2px solid #c4956a; padding-bottom: 10px; font-weight: normal; margin-top: 0;">
                    Gracias por tu compra
                </h2>

                <p style="color: #444; font-size: 15px;">Hola {$nombre},</p>
                <p style="color: #444; font-size: 15px;">
                    Tu pago se ha confirmado y ya tienes acceso al curso. Aquí tienes el justificante:
                </p>

                <div style="background-color: #ffffff; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
                    <p style="margin: 6px 0; font-size: 14px;"><strong>Pedido:</strong> #{$numero}</p>
                    <p style="margin: 6px 0; font-size: 14px;"><strong>Fecha:</strong> {$fecha}</p>
                    <p style="margin: 6px 0; font-size: 14px;"><strong>Referencia de pago:</strong> {$referencia}</p>
                </div>

                {$this->tablaConceptos()}

                <p style="text-align: right; font-size: 18px; color: #1a1a1a; margin: 14px 0 24px;">
                    <strong>Total pagado: {$total}</strong>
                </p>

                {$this->bloqueAcceso()}
                {$this->bloqueCuenta()}

                <p style="color: #888; font-size: 12px; margin-top: 28px; text-align: center;">
                    Makeup by Yona &middot; Atelier de Maquillaje en Ibiza<br>
                    Para cualquier duda, responde a este correo.
                </p>
            </div>
            HTML;
    }

    private function tablaConceptos(): string
    {
        $filas = '';

        foreach ($this->pedido->items as $item) {
            $titulo = e($item->tutorial?->titulo ?? 'Curso');
            $precio = e($this->importe($item->precio_unitario));

            $filas .= <<<HTML
                <tr>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #f0e6dc; font-size: 14px; color: #333;">{$titulo}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #f0e6dc; font-size: 14px; color: #333; text-align: right; white-space: nowrap;">{$precio}</td>
                </tr>
                HTML;
        }

        return <<<HTML
            <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr>
                        <th style="padding: 10px 12px; background-color: #f4eae0; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8a6d4f;">Concepto</th>
                        <th style="padding: 10px 12px; background-color: #f4eae0; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8a6d4f;">Importe</th>
                    </tr>
                </thead>
                <tbody>{$filas}</tbody>
            </table>
            HTML;
    }

    /**
     * Duracion del acceso. Va en el justificante a proposito: es una
     * condicion de lo comprado y tiene que quedar por escrito.
     */
    private function bloqueAcceso(): string
    {
        // Una sola consulta para todos los accesos de este pedido, en lugar
        // de una por linea a traves de la relacion del tutorial.
        $caducidades = AccesoTutorial::where('pedido_id', $this->pedido->id)
            ->pluck('expira_en', 'tutorial_id');

        $acceso = $this->pedido->items
            ->map(function ($item) use ($caducidades) {
                $titulo = e($item->tutorial?->titulo ?? 'Curso');
                $expira = $caducidades[$item->tutorial_id] ?? null;

                $texto = $expira
                    ? 'disponible hasta el '.e($this->enHoraLocal($expira, 'd/m/Y'))
                    : 'sin límite de tiempo';

                return "<li style=\"margin: 4px 0;\">{$titulo}: <strong>{$texto}</strong></li>";
            })
            ->implode('');

        $url = e(rtrim((string) config('app.frontend_url'), '/').'/mis-cursos');

        return <<<HTML
            <div style="background-color: #ffffff; padding: 18px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 18px;">
                <h3 style="color: #333; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px;">Tu acceso</h3>
                <ul style="margin: 0 0 14px; padding-left: 20px; font-size: 14px; color: #333; line-height: 1.7;">
                    {$acceso}
                </ul>
                <a href="{$url}" style="display: inline-block; background-color: #c4956a; color: #ffffff; text-decoration: none; padding: 11px 22px; border-radius: 999px; font-size: 13px; font-weight: bold;">
                    Ver mis cursos
                </a>
            </div>
            HTML;
    }

    /**
     * Solo aparece cuando la compra ha creado la cuenta: explica que el
     * usuario es su correo y da el enlace para fijar la contrasena.
     */
    private function bloqueCuenta(): string
    {
        if (! $this->enlacePassword) {
            return '';
        }

        $email = e($this->pedido->emailContacto() ?? '');
        $enlace = e($this->enlacePassword);
        $horas = (int) round(((int) config('auth.passwords.users.expire', 1440)) / 60);
        $login = e(rtrim((string) config('app.frontend_url'), '/').'/login');

        return <<<HTML
            <div style="background-color: #f4eae0; padding: 18px; border-radius: 8px; border: 1px solid #e5d3bf;">
                <h3 style="color: #8a6d4f; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px;">Hemos creado tu cuenta</h3>
                <p style="margin: 0 0 12px; font-size: 14px; color: #444; line-height: 1.6;">
                    Tu usuario es tu correo: <strong>{$email}</strong>.<br>
                    Solo falta que elijas una contraseña para entrar cuando quieras.
                </p>
                <a href="{$enlace}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; text-decoration: none; padding: 11px 22px; border-radius: 999px; font-size: 13px; font-weight: bold;">
                    Crear mi contraseña
                </a>
                <p style="margin: 12px 0 0; font-size: 12px; color: #8a6d4f;">
                    El enlace caduca en {$horas} horas. Si se te pasa, entra en
                    <a href="{$login}" style="color: #8a6d4f;">la pantalla de acceso</a>
                    y pulsa "¿Olvidaste tu contraseña?" para recibir uno nuevo.
                </p>
            </div>
            HTML;
    }

    private function importe(mixed $valor): string
    {
        return number_format((float) $valor, 2, ',', '.').' €';
    }

    /** Las fechas se guardan en UTC; al cliente se le muestran en su hora. */
    private function enHoraLocal(mixed $fecha, string $formato = 'd/m/Y H:i'): string
    {
        if (! $fecha) {
            return '-';
        }

        return \Carbon\Carbon::parse($fecha)
            ->setTimezone('Europe/Madrid')
            ->format($formato);
    }
}

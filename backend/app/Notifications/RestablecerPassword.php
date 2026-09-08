<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RestablecerPassword extends Notification
{
    use Queueable;

    public function __construct(public string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = rtrim(config('app.frontend_url'), '/')
            . '/restablecer-password?token=' . $this->token
            . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        $minutos = config('auth.passwords.users.expire', 60);

        return (new MailMessage)
            ->subject('Restablece tu contraseña · Makeup by Yona')
            ->greeting('Hola ' . $notifiable->name)
            ->line('Has solicitado restablecer la contraseña de tu cuenta.')
            ->action('Crear nueva contraseña', $url)
            ->line("Este enlace caduca en {$minutos} minutos.")
            ->line('Si no has sido tú, puedes ignorar este correo: tu contraseña no cambiará.')
            ->salutation('Un saludo, Makeup by Yona');
    }
}

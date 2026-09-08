<?php

namespace App\Console\Commands;

use App\Mail\AccesoPorCaducar;
use App\Models\AccesoTutorial;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Avisa a quien le queda un mes de acceso a un curso.
 *
 * Lo ejecuta el planificador una vez al dia (routes/console.php).
 */
class AvisarCaducidadAccesos extends Command
{
    protected $signature = 'cursos:avisar-caducidad
                            {--dias=30 : Antelacion del aviso}
                            {--simular : Muestra a quien se avisaria sin enviar nada}';

    protected $description = 'Envía el aviso de acceso a punto de caducar';

    public function handle(): int
    {
        $dias = (int) $this->option('dias');
        $simular = (bool) $this->option('simular');

        // Ventana: accesos que caducan dentro de los proximos N dias y que
        // todavia no se han avisado. Se excluyen los ya caducados: para esos
        // el aviso llega tarde y solo seria ruido.
        $accesos = AccesoTutorial::query()
            ->with(['user', 'tutorial'])
            ->whereNotNull('expira_en')
            ->whereNull('aviso_expiracion_enviado_en')
            ->where('expira_en', '>', now())
            ->where('expira_en', '<=', now()->addDays($dias))
            ->get();

        if ($accesos->isEmpty()) {
            $this->info('No hay accesos por caducar en los próximos '.$dias.' días.');

            return self::SUCCESS;
        }

        $this->info($accesos->count().' aviso(s) por enviar'.($simular ? ' [simulación]' : '').':');

        $enviados = 0;

        foreach ($accesos as $acceso) {
            $destino = $acceso->user?->email;

            if (! $destino) {
                $this->warn('  acceso #'.$acceso->id.': sin usuario con correo, se omite');
                continue;
            }

            $this->line(sprintf(
                '  %s · %s · caduca %s',
                $destino,
                $acceso->tutorial?->titulo ?? 'curso '.$acceso->tutorial_id,
                $acceso->expira_en->setTimezone('Europe/Madrid')->format('d/m/Y')
            ));

            if ($simular) {
                continue;
            }

            try {
                Mail::to($destino)->send(new AccesoPorCaducar($acceso));

                // Se marca solo si el envio no ha lanzado: si falla, el aviso
                // se reintenta manana en lugar de perderse en silencio.
                $acceso->update(['aviso_expiracion_enviado_en' => now()]);
                $enviados++;
            } catch (\Throwable $e) {
                Log::error('Error enviando aviso de caducidad', [
                    'acceso_id' => $acceso->id,
                    'error' => $e->getMessage(),
                ]);
                $this->error('    fallo al enviar: '.$e->getMessage());
            }
        }

        if (! $simular) {
            $this->info($enviados.' aviso(s) enviado(s).');
        }

        return self::SUCCESS;
    }
}

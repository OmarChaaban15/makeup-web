<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Los tokens de Sanctum ahora caducan (config/sanctum.php). Sin esta poda
// la tabla personal_access_tokens crece indefinidamente con tokens muertos.
Schedule::command('sanctum:prune-expired --hours=24')->daily();

// Limpieza del registro de eventos de Stripe: solo lo necesitamos para
// detectar reentregas, que Stripe deja de intentar a los 3 dias.
Schedule::call(function () {
    \Illuminate\Support\Facades\DB::table('stripe_webhook_events')
        ->where('procesado_en', '<', now()->subDays(30))
        ->delete();
})->daily()->name('purga-eventos-stripe');

// Aviso de "te queda un mes de acceso". A las 10:00 de Espana, que es una
// hora razonable para que llegue un correo comercial.
Schedule::command('cursos:avisar-caducidad')
    ->dailyAt('10:00')
    ->timezone('Europe/Madrid');

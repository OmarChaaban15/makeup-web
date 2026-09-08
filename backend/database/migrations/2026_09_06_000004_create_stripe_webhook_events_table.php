<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Registro de eventos de Stripe ya procesados. Stripe reintenta la
     * entrega de un mismo evento hasta 3 dias, asi que necesitamos una
     * clave unica para no reprocesarlo.
     */
    public function up(): void
    {
        Schema::create('stripe_webhook_events', function (Blueprint $table) {
            $table->id();
            $table->string('stripe_event_id', 100)->unique();
            $table->string('tipo', 100);
            $table->timestamp('procesado_en')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stripe_webhook_events');
    }
};

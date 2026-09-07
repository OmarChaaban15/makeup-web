<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Precio de oferta con ventana temporal, y duracion del acceso.
     *
     * "precio" pasa a ser el precio base (55 EUR) y "precio_oferta" el
     * promocional (45 EUR). Stripe no permite cambiar el importe de un
     * price: hacen falta dos objetos distintos, de ahi el segundo
     * stripe_price_id.
     *
     * Las fechas se guardan en UTC, como todo en la aplicacion
     * (config/app.php timezone = UTC). La conversion desde hora de Espana
     * se hace al sembrar y al mostrar, nunca aqui.
     */
    public function up(): void
    {
        Schema::table('tutoriales', function (Blueprint $table) {
            $table->decimal('precio_oferta', 8, 2)->nullable()->after('precio');
            $table->string('stripe_price_id_oferta', 100)->nullable()->after('stripe_price_id');

            // Ventana de la oferta. Fuera de ella se cobra el precio base.
            $table->timestamp('oferta_inicio')->nullable()->after('stripe_price_id_oferta');
            $table->timestamp('oferta_fin')->nullable()->after('oferta_inicio');

            // Meses de acceso que se conceden al comprar. Null = sin caducidad,
            // para no romper nada que se vendiera antes con acceso indefinido.
            $table->unsignedSmallInteger('duracion_acceso_meses')->nullable()->default(6)->after('oferta_fin');
        });
    }

    public function down(): void
    {
        Schema::table('tutoriales', function (Blueprint $table) {
            $table->dropColumn([
                'precio_oferta',
                'stripe_price_id_oferta',
                'oferta_inicio',
                'oferta_fin',
                'duracion_acceso_meses',
            ]);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * El modelo Tutorial y PedidoController ya usaban stripe_price_id,
     * pero ninguna migracion creaba la columna: el checkout de Stripe
     * recibia price=null y fallaba siempre.
     */
    public function up(): void
    {
        Schema::table('tutoriales', function (Blueprint $table) {
            $table->string('stripe_price_id', 100)->nullable()->after('precio');
        });
    }

    public function down(): void
    {
        Schema::table('tutoriales', function (Blueprint $table) {
            $table->dropColumn('stripe_price_id');
        });
    }
};

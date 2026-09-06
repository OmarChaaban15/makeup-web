<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * pedidos solo tenia creado_en. Sin marca de actualizacion no habia
     * forma de saber cuando el webhook de Stripe cambio el estado.
     */
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->timestamp('actualizado_en')->nullable()->after('creado_en');
        });
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn('actualizado_en');
        });
    }
};

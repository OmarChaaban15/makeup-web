<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Momento en que la compradora pidio el acceso inmediato y reconocio que
     * pierde el derecho de desistimiento (art. 103.m TRLGDCU). Es la prueba
     * de ese consentimiento, y el justificante lo confirma por escrito.
     *
     * Nullable porque los pedidos anteriores no lo tienen.
     */
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->timestamp('renuncia_desistimiento_en')->nullable()->after('metodo_pago');
        });
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn('renuncia_desistimiento_en');
        });
    }
};

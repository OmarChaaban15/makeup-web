<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Caducidad del acceso a un curso.
     *
     * expira_en null significa acceso sin limite: es lo que tenian los
     * accesos concedidos antes de este cambio, y hay que respetarlo porque
     * en su momento se vendio asi.
     */
    public function up(): void
    {
        Schema::table('accesos_tutorial', function (Blueprint $table) {
            $table->timestamp('expira_en')->nullable()->after('concedido_en');

            // Marca de que ya se envio el aviso de "queda un mes". Evita
            // repetirlo cada dia que la tarea programada se ejecute.
            $table->timestamp('aviso_expiracion_enviado_en')->nullable()->after('expira_en');

            // La tarea diaria busca por fecha de caducidad.
            $table->index('expira_en');
        });
    }

    public function down(): void
    {
        Schema::table('accesos_tutorial', function (Blueprint $table) {
            $table->dropIndex(['expira_en']);
            $table->dropColumn(['expira_en', 'aviso_expiracion_enviado_en']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * En la migracion original se escribio
     * foreignId('pedido_id')->nullable()->nullOnDelete() sin constrained(),
     * asi que nullOnDelete() se absorbio en el Fluent y la clave ajena
     * nunca llego a crearse.
     */
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('accesos_tutorial', function (Blueprint $table) {
            $table->foreign('pedido_id')
                  ->references('id')->on('pedidos')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('accesos_tutorial', function (Blueprint $table) {
            $table->dropForeign(['pedido_id']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Elimina las dos columnas que quedaron de la pasarela anterior.
     *
     * Ningun modelo ni controlador las leia ni las escribia: siempre
     * estuvieron vacias. La migracion que las creaba ya no esta en el
     * repositorio, asi que en una base de datos nueva estas columnas no
     * llegan a existir; por eso cada drop va comprobado con hasColumn.
     */
    private const COLUMNAS = ['hotmart_product_id', 'hotmart_checkout_url'];

    public function up(): void
    {
        $existentes = array_values(array_filter(
            self::COLUMNAS,
            fn (string $columna) => Schema::hasColumn('tutoriales', $columna)
        ));

        if ($existentes === []) {
            return;
        }

        Schema::table('tutoriales', function (Blueprint $table) use ($existentes) {
            $table->dropColumn($existentes);
        });
    }

    /**
     * No se revierte: son columnas muertas y recrearlas no aportaria nada.
     */
    public function down(): void
    {
        //
    }
};

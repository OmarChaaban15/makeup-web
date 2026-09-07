<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Compra sin cuenta previa.
     *
     * El pedido se crea antes de que exista el usuario: la cuenta se da de
     * alta en el webhook, cuando el pago ya esta confirmado. Asi una compra
     * abandonada no deja usuarios fantasma con un correo "ya registrado"
     * que impediria registrarse despues.
     *
     * Por eso user_id pasa a ser nullable y se guardan los datos de
     * contacto en el propio pedido.
     */
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->string('email_cliente', 180)->nullable()->after('user_id');
            $table->string('nombre_cliente', 100)->nullable()->after('email_cliente');
        });

        // SQLite no admite eliminar claves ajenas: Laravel reconstruye la
        // tabla al hacer change() y las conserva, asi que ahi basta el change.
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            Schema::table('pedidos', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->change();
            });

            return;
        }

        // En MySQL hay que soltar la clave ajena para poder alterar la
        // columna, y volver a ponerla despues.
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('pedidos', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
        });

        Schema::table('pedidos', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn(['email_cliente', 'nombre_cliente']);
        });
    }
};

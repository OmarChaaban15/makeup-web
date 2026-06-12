<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->enum('estado', ['pendiente', 'pagado', 'cancelado', 'reembolsado'])
                  ->default('pendiente');
            $table->decimal('total', 10, 2);
            $table->string('metodo_pago', 50)->nullable();
            $table->string('referencia_pago', 200)->nullable();
            $table->timestamp('creado_en')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};
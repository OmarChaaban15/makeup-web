<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('citas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->nullOnDelete();
            $table->unsignedInteger('servicio_id');
            $table->dateTime('fecha_hora');
            $table->string('nombre_cliente', 100);
            $table->string('email_cliente', 180);
            $table->string('telefono_cliente', 20)->nullable();
            $table->text('notas')->nullable();
            $table->enum('estado', ['pendiente', 'confirmada', 'completada', 'cancelada'])
                  ->default('pendiente');
            $table->timestamp('creada_en')->useCurrent();

            $table->foreign('servicio_id')
                  ->references('id')->on('servicios');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('citas');
    }
};
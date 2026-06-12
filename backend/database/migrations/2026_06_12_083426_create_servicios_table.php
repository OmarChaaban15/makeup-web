<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servicios', function (Blueprint $table) {
            $table->unsignedInteger('id')->autoIncrement();
            $table->unsignedInteger('categoria_id')->nullable();
            $table->string('nombre', 120);
            $table->text('descripcion')->nullable();
            $table->decimal('precio', 8, 2);
            $table->unsignedSmallInteger('duracion_min')->nullable();
            $table->string('imagen_url', 300)->nullable();
            $table->boolean('activo')->default(true);

            $table->foreign('categoria_id')
                  ->references('id')->on('categorias')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servicios');
    }
};
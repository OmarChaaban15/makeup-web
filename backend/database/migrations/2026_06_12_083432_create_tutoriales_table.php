<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tutoriales', function (Blueprint $table) {
            $table->unsignedInteger('id')->autoIncrement();
            $table->unsignedInteger('categoria_id')->nullable();
            $table->string('titulo', 160);
            $table->string('descripcion_corta', 300)->nullable();
            $table->text('descripcion_larga')->nullable();
            $table->decimal('precio', 8, 2);
            $table->string('video_url', 300)->nullable();
            $table->string('miniatura_url', 300)->nullable();
            $table->enum('nivel', ['basico', 'intermedio', 'avanzado'])->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamp('creado_en')->useCurrent();

            $table->foreign('categoria_id')
                  ->references('id')->on('categorias')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutoriales');
    }
};
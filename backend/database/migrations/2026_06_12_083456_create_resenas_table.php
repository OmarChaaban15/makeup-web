<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resenas', function (Blueprint $table) {
            $table->unsignedInteger('id')->autoIncrement();
            $table->foreignId('user_id')->nullable()->nullOnDelete();
            $table->unsignedInteger('servicio_id')->nullable();
            $table->unsignedInteger('tutorial_id')->nullable();
            $table->unsignedTinyInteger('puntuacion');
            $table->text('comentario')->nullable();
            $table->boolean('aprobada')->default(false);
            $table->timestamp('creada_en')->useCurrent();

            $table->foreign('servicio_id')
                  ->references('id')->on('servicios')->nullOnDelete();
            $table->foreign('tutorial_id')
                  ->references('id')->on('tutoriales')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resenas');
    }
};
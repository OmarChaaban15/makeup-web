<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accesos_tutorial', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->unsignedInteger('tutorial_id');
            $table->foreignId('pedido_id')->nullable()->nullOnDelete();
            $table->timestamp('concedido_en')->useCurrent();

            $table->unique(['user_id', 'tutorial_id']);

            $table->foreign('tutorial_id')
                  ->references('id')->on('tutoriales');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accesos_tutorial');
    }
};
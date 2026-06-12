<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedido_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')
                  ->constrained('pedidos')
                  ->cascadeOnDelete();
            $table->unsignedInteger('tutorial_id');
            $table->decimal('precio_unitario', 8, 2);

            $table->foreign('tutorial_id')
                  ->references('id')->on('tutoriales');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedido_items');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tutoriales', function (Blueprint $table) {
            $table->string('hotmart_product_id', 50)->nullable()->after('video_url');
            $table->string('hotmart_checkout_url', 300)->nullable()->after('hotmart_product_id');
        });
    }

    public function down(): void
    {
        Schema::table('tutoriales', function (Blueprint $table) {
            $table->dropColumn(['hotmart_product_id', 'hotmart_checkout_url']);
        });
    }
};

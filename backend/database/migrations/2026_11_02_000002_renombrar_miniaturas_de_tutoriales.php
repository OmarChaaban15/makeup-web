<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Las fotos de public/images pasaron a tener nombres descriptivos (SEO de
     * imagenes). La portada de la masterclass esta guardada en la base de
     * datos, asi que hay que actualizarla aqui ademas de en el seeder.
     * Nginx redirige ademas la URL antigua con un 301.
     */
    private const RENOMBRES = [
        'images/portada_automaquillaje.png' => 'images/masterclass-automaquillaje-portada.png',
    ];

    public function up(): void
    {
        foreach (self::RENOMBRES as $antes => $despues) {
            DB::table('tutoriales')->where('miniatura_url', $antes)->update(['miniatura_url' => $despues]);
        }
    }

    public function down(): void
    {
        foreach (self::RENOMBRES as $antes => $despues) {
            DB::table('tutoriales')->where('miniatura_url', $despues)->update(['miniatura_url' => $antes]);
        }
    }
};

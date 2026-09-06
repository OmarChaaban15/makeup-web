<?php

namespace Database\Seeders;

use App\Models\AccesoTutorial;
use App\Models\Categoria;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Tutorial;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $categoria = Categoria::firstOrCreate(
            ['slug' => 'masterclass'],
            ['nombre' => 'Masterclass', 'descripcion' => 'Formación en vídeo bajo demanda.']
        );

        // Curso de muestra gratuito.
        Tutorial::firstOrCreate(
            ['titulo' => 'Video de maquillaje para principiantes'],
            [
                'categoria_id' => $categoria->id,
                'descripcion_corta' => 'Video introductorio de maquillaje.',
                'descripcion_larga' => 'Este tutorial muestra los fundamentos del maquillaje para principiantes.',
                'precio' => 0,
                'video_url' => 'https://www.youtube.com/embed/ScMzIvxBSi4',
                'miniatura_url' => 'https://img.youtube.com/vi/ScMzIvxBSi4/hqdefault.jpg',
                'nivel' => 'basico',
                'activo' => true,
            ]
        );

        // Masterclass de pago: es la que vende la pagina /cursos. El
        // stripe_price_id viene del panel de Stripe (price_...), no se inventa.
        $masterclass = Tutorial::firstOrCreate(
            ['titulo' => 'Masterclass de Automaquillaje'],
            [
                'categoria_id' => $categoria->id,
                'descripcion_corta' => 'Aprende a maquillarte en 15 minutos con acabado profesional.',
                'descripcion_larga' => 'Masterclass completa de automaquillaje: preparación de piel, base luminosa, ojos y labios, con acceso de por vida.',
                'precio' => 45.00,
                // Por config y no por env(): con la configuracion cacheada
                // en produccion, env() devuelve null.
                'stripe_price_id' => config('services.stripe.price_masterclass'),
                'video_url' => null,
                'miniatura_url' => 'images/portada_automaquillaje.png',
                'nivel' => 'basico',
                'activo' => true,
            ]
        );

        if (! $masterclass->stripe_price_id) {
            $this->command?->warn(
                'La masterclass no tiene stripe_price_id: el botón de compra devolverá 503. '
                .'Vincúlala con: php artisan stripe:vincular --listar'
            );
        }

        // A partir de aqui son datos de prueba: no deben crearse en produccion.
        if (app()->environment('production')) {
            return;
        }

        $this->sembrarUsuarioDePrueba();
    }

    private function sembrarUsuarioDePrueba(): void
    {
        $tutorialGratis = Tutorial::where('titulo', 'Video de maquillaje para principiantes')->first();

        $user = User::firstOrNew(['email' => 'test-user-id1@example.com']);
        $user->name = 'Test User';
        $user->password = Hash::make('password123');
        $user->save();

        $pedido = Pedido::firstOrCreate(
            ['user_id' => $user->id, 'referencia_pago' => 'seed-'.$tutorialGratis->id],
            [
                'estado' => 'pagado',
                'total' => $tutorialGratis->precio,
                'metodo_pago' => 'seed',
            ]
        );

        PedidoItem::firstOrCreate(
            ['pedido_id' => $pedido->id, 'tutorial_id' => $tutorialGratis->id],
            ['precio_unitario' => $tutorialGratis->precio]
        );

        AccesoTutorial::firstOrCreate(
            ['user_id' => $user->id, 'tutorial_id' => $tutorialGratis->id],
            ['pedido_id' => $pedido->id]
        );
    }
}

<?php

namespace Database\Seeders;

use App\Models\AccesoTutorial;
use App\Models\Categoria;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Tutorial;
use App\Models\User;
use Carbon\Carbon;
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

        // Masterclass de pago: es la que vende /cursos y la landing /oferta.
        //
        // precio        = tarifa base (55 EUR), la que queda al acabar la oferta
        // precio_oferta = promocional (45 EUR) mientras dura la ventana
        //
        // Stripe no permite cambiar el importe de un price, asi que hacen
        // falta dos objetos distintos, uno por importe.
        //
        // La ventana va de las 19:00 del 08/09/2026 a las 19:00 del 09/09/2026
        // en hora peninsular. La aplicacion trabaja en UTC (config/app.php),
        // asi que se convierte explicitamente con ->utc(): en septiembre
        // Madrid es UTC+2, y guardar "19:00" a secas seria dos horas tarde.
        $masterclass = Tutorial::firstOrCreate(
            ['titulo' => 'Masterclass de Automaquillaje'],
            [
                'categoria_id' => $categoria->id,
                'descripcion_corta' => 'Aprende a maquillarte en 15 minutos con acabado profesional.',
                'descripcion_larga' => 'Masterclass completa de automaquillaje: preparación de piel, base luminosa, ojos y labios. Incluye 6 meses de acceso desde la compra.',
                'precio' => 55.00,
                'precio_oferta' => 45.00,
                // Por config y no por env(): con la configuracion cacheada en
                // produccion, env() devuelve null.
                'stripe_price_id' => config('services.stripe.price_masterclass'),
                'stripe_price_id_oferta' => config('services.stripe.price_masterclass_oferta'),
                'oferta_inicio' => Carbon::parse('2026-09-08 19:00:00', 'Europe/Madrid')->utc(),
                'oferta_fin' => Carbon::parse('2026-09-09 19:00:00', 'Europe/Madrid')->utc(),
                'duracion_acceso_meses' => 6,
                'video_url' => null,
                'miniatura_url' => 'images/portada_automaquillaje.png',
                'nivel' => 'basico',
                'activo' => true,
            ]
        );

        $faltan = collect([
            'stripe_price_id' => $masterclass->stripe_price_id,
            'stripe_price_id_oferta' => $masterclass->stripe_price_id_oferta,
        ])->filter(fn ($valor) => empty($valor))->keys();

        if ($faltan->isNotEmpty()) {
            $this->command?->warn(
                'La masterclass no tiene '.$faltan->implode(' ni ').': el botón de compra '
                .'devolverá 503 cuando toque ese importe. Vincúlalos con: '
                .'php artisan stripe:vincular --listar'
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

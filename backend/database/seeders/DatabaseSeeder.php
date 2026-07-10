<?php

namespace Database\Seeders;

use App\Models\AccesoTutorial;
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

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::find(1);

        if (! $user) {
            $user = new User();
            $user->id = 1;
            $user->name = 'Test User';
            $user->email = 'test-user-id1@example.com';
            $user->password = Hash::make('password123');
            $user->save();
        } else {
            $user->name = 'Test User';
            $user->password = Hash::make('password123');
            $user->save();
        }

        $tutorial = Tutorial::firstOrCreate(
            ['titulo' => 'Video de maquillaje para principiantes'],
            [
                'categoria_id' => null,
                'descripcion_corta' => 'Video introductorio de maquillaje.',
                'descripcion_larga' => 'Este tutorial muestra los fundamentos del maquillaje para principiantes.',
                'precio' => 0,
                'video_url' => 'https://www.youtube.com/embed/ScMzIvxBSi4',
                'miniatura_url' => 'https://img.youtube.com/vi/ScMzIvxBSi4/hqdefault.jpg',
                'nivel' => 'basico',
                'activo' => true,
            ]
        );

        $pedido = Pedido::firstOrCreate(
            [
                'user_id' => $user->id,
                'estado' => 'pagado',
            ],
            [
                'total' => $tutorial->precio,
                'metodo_pago' => 'seed',
                'referencia_pago' => 'seed-' . $tutorial->id,
            ]
        );

        $pedidoItem = PedidoItem::firstOrCreate(
            [
                'pedido_id' => $pedido->id,
                'tutorial_id' => $tutorial->id,
            ],
            [
                'precio_unitario' => $tutorial->precio,
            ]
        );

        AccesoTutorial::firstOrCreate(
            [
                'user_id' => $user->id,
                'tutorial_id' => $tutorial->id,
            ],
            [
                'pedido_id' => $pedido->id,
            ]
        );
    }
}

<?php

namespace App\Console\Commands;

use App\Models\Tutorial;
use Illuminate\Console\Command;
use Stripe\StripeClient;

/**
 * Vincula un tutorial con su precio de Stripe.
 *
 * El stripe_price_id no se puede inventar: lo genera Stripe al crear el
 * producto. Este comando evita tener que editar la tabla a mano y, sobre
 * todo, comprueba contra la API que el precio existe y está activo antes
 * de guardarlo, que es el fallo que dejaba el botón de compra muerto.
 */
class VincularPrecioStripe extends Command
{
    protected $signature = 'stripe:vincular
                            {tutorial? : ID del tutorial}
                            {price? : ID del precio en Stripe (price_...)}
                            {--listar : Muestra el estado actual y los precios disponibles}';

    protected $description = 'Asocia un tutorial con su precio de Stripe y verifica que existe';

    public function handle(StripeClient $stripe): int
    {
        if ($this->option('listar') || ! $this->argument('tutorial')) {
            return $this->mostrarEstado($stripe);
        }

        $tutorial = Tutorial::find($this->argument('tutorial'));

        if (! $tutorial) {
            $this->error('No existe ningún tutorial con ese ID. Usa --listar para verlos.');

            return self::FAILURE;
        }

        $priceId = $this->argument('price')
            ?: $this->ask('ID del precio en Stripe (price_...)');

        try {
            $precio = $stripe->prices->retrieve($priceId, ['expand' => ['product']]);
        } catch (\Throwable $e) {
            $this->error('Stripe no reconoce ese precio: '.$e->getMessage());

            return self::FAILURE;
        }

        if (! $precio->active) {
            $this->error('Ese precio existe pero está archivado en Stripe. Usa uno activo.');

            return self::FAILURE;
        }

        $importeStripe = $precio->unit_amount / 100;

        if (abs($importeStripe - (float) $tutorial->precio) > 0.001) {
            $this->warn(sprintf(
                'Aviso: el tutorial cuesta %s € en la web y %s %s en Stripe.',
                number_format((float) $tutorial->precio, 2),
                number_format($importeStripe, 2),
                strtoupper($precio->currency)
            ));

            if (! $this->confirm('¿Vincular de todos modos?', false)) {
                return self::FAILURE;
            }
        }

        $tutorial->update(['stripe_price_id' => $precio->id]);

        $this->info(sprintf('"%s" vinculado con %s.', $tutorial->titulo, $precio->id));

        return self::SUCCESS;
    }

    private function mostrarEstado(StripeClient $stripe): int
    {
        $this->line('');
        $this->line('<comment>Tutoriales</comment>');

        $tutoriales = Tutorial::orderBy('id')->get();

        if ($tutoriales->isEmpty()) {
            $this->warn('  No hay tutoriales. Ejecuta php artisan db:seed');

            return self::SUCCESS;
        }

        $this->table(
            ['ID', 'Título', 'Precio', 'Activo', 'stripe_price_id'],
            $tutoriales->map(fn (Tutorial $t) => [
                $t->id,
                $t->titulo,
                number_format((float) $t->precio, 2).' €',
                $t->activo ? 'sí' : 'no',
                $t->stripe_price_id ?: '<fg=red>SIN VINCULAR</>',
            ])->all()
        );

        $this->line('<comment>Precios activos en Stripe</comment>');

        try {
            $precios = $stripe->prices->all(['active' => true, 'limit' => 20, 'expand' => ['data.product']]);
        } catch (\Throwable $e) {
            $this->warn('  No se pudo consultar Stripe: '.$e->getMessage());
            $this->line('  Revisa STRIPE_SECRET en el .env.');

            return self::SUCCESS;
        }

        if (count($precios->data) === 0) {
            $this->warn('  Stripe no devuelve precios activos. Crea el producto en el panel.');

            return self::SUCCESS;
        }

        $this->table(
            ['price_id', 'Producto', 'Importe'],
            collect($precios->data)->map(fn ($p) => [
                $p->id,
                $p->product->name ?? '—',
                $p->unit_amount === null
                    ? '—'
                    : number_format($p->unit_amount / 100, 2).' '.strtoupper($p->currency),
            ])->all()
        );

        $this->line('');
        $this->line('  Para vincular:  <info>php artisan stripe:vincular {ID tutorial} {price_id}</info>');
        $this->line('');

        return self::SUCCESS;
    }
}

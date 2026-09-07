<?php

namespace App\Http\Controllers;

use App\Models\AccesoTutorial;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Tutorial;
use App\Models\User;
use App\Services\PasarelaPago;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PedidoController extends Controller
{
    public function index(Request $request)
    {
        $pedidos = Pedido::with('items.tutorial')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('id')
            ->get();

        return response()->json($pedidos);
    }

    /**
     * Inicia una compra.
     *
     * Funciona con sesion iniciada y tambien como invitado: en ese caso se
     * piden nombre y correo, y la cuenta se crea en el webhook, cuando el
     * pago ya esta confirmado. Asi una compra abandonada no deja usuarios
     * fantasma cuyo correo apareceria como "ya registrado".
     *
     * La ruta es publica, asi que hay que pedir el guard sanctum de forma
     * explicita (el guard por defecto es web y devolveria null siempre).
     */
    public function store(Request $request, PasarelaPago $pasarela)
    {
        $usuario = $request->user() ?? auth('sanctum')->user();

        $reglas = [
            'tutoriales' => 'required|array|min:1|max:20',
            'tutoriales.*' => 'integer|distinct|exists:tutoriales,id',
        ];

        if (! $usuario) {
            $reglas['email'] = 'required|email|max:180';
            $reglas['nombre'] = 'required|string|max:100';
        }

        $validated = $request->validate($reglas, [
            'tutoriales.required' => 'Selecciona al menos un curso.',
            'tutoriales.*.exists' => 'Alguno de los cursos seleccionados ya no está disponible.',
            'email.required' => 'Necesitamos tu correo electrónico para darte acceso al curso.',
            'email.email' => 'Introduce un correo electrónico válido.',
            'nombre.required' => 'El nombre es obligatorio.',
        ]);

        $email = $usuario?->email ?? $validated['email'];
        $nombre = $usuario?->name ?? $validated['nombre'];

        $tutoriales = Tutorial::whereIn('id', $validated['tutoriales'])
            ->where('activo', true)
            ->get();

        if ($tutoriales->count() !== count($validated['tutoriales'])) {
            throw ValidationException::withMessages([
                'tutoriales' => ['Alguno de los cursos seleccionados ya no está disponible.'],
            ]);
        }

        // Sin price configurado en Stripe, la sesion de Checkout se crearia
        // con price=null. Mejor fallar aqui con un mensaje util.
        $sinPrecio = $tutoriales->filter(fn (Tutorial $t) => $t->stripePriceIdEfectivo() === null);

        if ($sinPrecio->isNotEmpty()) {
            Log::error('Tutoriales sin price de Stripe para el importe vigente', [
                'ids' => $sinPrecio->pluck('id')->all(),
                'oferta_activa' => $sinPrecio->first()->tieneOfertaActiva(),
            ]);

            return response()->json([
                'message' => 'Este curso no está disponible para la compra en este momento. Inténtalo más tarde.',
            ], 503);
        }

        // Evitamos cobrar dos veces por lo que ya se puede ver. Se comprueba
        // por correo y no solo por sesion, para que un invitado que ya compro
        // no pague de nuevo.
        if ($this->yaTieneAcceso($email, $tutoriales)) {
            return response()->json([
                'message' => 'Ya tienes acceso a este curso. Lo encontrarás en "Mis cursos".',
            ], 409);
        }

        $pedido = DB::transaction(function () use ($usuario, $email, $nombre, $tutoriales) {
            $pedido = Pedido::create([
                'user_id' => $usuario?->id,
                'email_cliente' => $email,
                'nombre_cliente' => $nombre,
                'estado' => 'pendiente',
                // Se guarda el importe vigente en el momento de la compra:
                // si la oferta caduca despues, el pedido conserva lo pagado.
                'total' => $tutoriales->sum(fn (Tutorial $t) => (float) $t->precio_efectivo),
                'metodo_pago' => 'stripe',
            ]);

            foreach ($tutoriales as $tutorial) {
                PedidoItem::create([
                    'pedido_id' => $pedido->id,
                    'tutorial_id' => $tutorial->id,
                    'precio_unitario' => $tutorial->precio_efectivo,
                ]);
            }

            return $pedido;
        });

        // La llamada a la pasarela va fuera de la transaccion (es I/O de red),
        // pero si falla hay que marcar el pedido como cancelado: antes se
        // quedaba colgado en "pendiente" y el usuario recibia un 500 pelado.
        try {
            $checkoutUrl = $pasarela->crearSesionCheckout($pedido, $tutoriales, $email);
        } catch (\Throwable $e) {
            $pedido->update(['estado' => 'cancelado', 'actualizado_en' => now()]);

            Log::error('Error creando la sesión de Stripe Checkout', [
                'pedido_id' => $pedido->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo iniciar el pago seguro. Inténtalo de nuevo en unos minutos.',
            ], 502);
        }

        return response()->json([
            'pedido' => $pedido,
            'checkout_url' => $checkoutUrl,
        ], 201);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Tutorial>  $tutoriales
     */
    private function yaTieneAcceso(string $email, $tutoriales): bool
    {
        $userId = User::where('email', $email)->value('id');

        if (! $userId) {
            return false;
        }

        return AccesoTutorial::query()
            ->vigentes()
            ->where('user_id', $userId)
            ->whereIn('tutorial_id', $tutoriales->pluck('id'))
            ->exists();
    }
}

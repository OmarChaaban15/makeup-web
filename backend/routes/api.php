<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ServicioController;
use App\Http\Controllers\TutorialController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\CitaController;
use App\Http\Controllers\ResenaController;
use App\Http\Controllers\AccesoTutorialController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactoController;
use App\Http\Controllers\Api\StripeWebhookController;

// ─── Autenticacion (sin sesion previa) ───────────────────────────────
// throttle:login limita por IP y por email para frenar la fuerza bruta.
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:login');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:correo');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:login');

// ─── Lectura publica ─────────────────────────────────────────────────
Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/categorias/{id}', [CategoriaController::class, 'show']);
Route::get('/servicios', [ServicioController::class, 'index']);
Route::get('/servicios/{id}', [ServicioController::class, 'show']);
Route::get('/tutoriales', [TutorialController::class, 'index']);
Route::get('/tutoriales/{id}', [TutorialController::class, 'show']);
Route::get('/resenas', [ResenaController::class, 'index']);

// ─── Escritura publica (con limite de peticiones) ────────────────────
Route::post('/resenas', [ResenaController::class, 'store'])->middleware('throttle:escritura-publica');
Route::post('/citas', [CitaController::class, 'store'])->middleware('throttle:correo');
Route::post('/contacto', [ContactoController::class, 'enviar'])->middleware('throttle:correo');

// ─── Rutas privadas ──────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/pedidos', [PedidoController::class, 'index']);
    Route::post('/pedidos', [PedidoController::class, 'store']);
    Route::get('/citas', [CitaController::class, 'index']);
    Route::get('/mis-cursos', [AccesoTutorialController::class, 'index']);
});

// ─── Webhook de Stripe ───────────────────────────────────────────────
// Sin throttle: Stripe reintenta y no debe toparse con un 429.
Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle'])
    ->withoutMiddleware('throttle:api');

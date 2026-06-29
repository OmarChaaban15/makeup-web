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

// Auth routes (sin login)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Rutas públicas (sin login)
Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/categorias/{id}', [CategoriaController::class, 'show']);
Route::get('/servicios', [ServicioController::class, 'index']);
Route::get('/servicios/{id}', [ServicioController::class, 'show']);
Route::get('/tutoriales', [TutorialController::class, 'index']);
Route::get('/tutoriales/{id}', [TutorialController::class, 'show']);
Route::get('/resenas', [ResenaController::class, 'index']);
Route::post('/resenas', [ResenaController::class, 'store']);
Route::post('/citas', [CitaController::class, 'store']);

// Rutas privadas (requieren login)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/pedidos', [PedidoController::class, 'index']);
    Route::post('/pedidos', [PedidoController::class, 'store']);
    Route::get('/citas', [CitaController::class, 'index']);
});
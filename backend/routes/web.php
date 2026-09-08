<?php

use Illuminate\Support\Facades\Route;

/*
 * En produccion Nginx sirve el SPA de Angular en "/" y solo enruta /api y
 * /up hacia Laravel, asi que esta ruta solo se ve al usar "php artisan serve".
 *
 * Se declara con Route::view y no con un closure a proposito: los closures
 * no se pueden serializar, y "php artisan route:cache" (que ejecuta el
 * despliegue) aborta con "Unable to prepare route [/] for serialization".
 */
Route::view('/', 'welcome');

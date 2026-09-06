<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Detras de Nginx necesitamos el header X-Forwarded-* para que
        // request()->ip() no devuelva siempre 127.0.0.1 (lo usan los
        // rate limiters) y para que las URLs se generen en https.
        $middleware->trustProxies(at: [
            '127.0.0.1',
            '::1',
        ]);

        // El grupo api del skeleton no incluye throttle. Los limitadores
        // se definen en AppServiceProvider.
        $middleware->throttleApi('api');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();

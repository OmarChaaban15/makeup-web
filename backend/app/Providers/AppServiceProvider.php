<?php

namespace App\Providers;

use App\Services\PasarelaPago;
use App\Services\StripePasarelaPago;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Stripe\StripeClient;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(StripeClient::class, fn () => new StripeClient(
            config('services.stripe.secret') ?: 'sk_test_placeholder'
        ));

        $this->app->bind(PasarelaPago::class, StripePasarelaPago::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * El grupo api de Laravel 11+ no trae throttle por defecto. Sin estos
     * limitadores login quedaba abierto a fuerza bruta y los endpoints
     * publicos que envian correo (contacto, citas) a spam masivo.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Credenciales: limite por IP y tambien por email, para que probar
        // muchas contrasenas de una misma cuenta desde IPs rotativas no salga gratis.
        RateLimiter::for('login', function (Request $request) {
            return [
                Limit::perMinute(5)->by($request->ip()),
                Limit::perMinute(5)->by((string) $request->input('email')),
            ];
        });

        // Endpoints publicos que disparan envio de correo.
        RateLimiter::for('correo', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip());
        });

        // Escritura publica sin autenticacion (resenas).
        RateLimiter::for('escritura-publica', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });
    }
}

<?php

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
|
| Los origenes permitidos se leen de CORS_ALLOWED_ORIGINS (lista separada
| por comas) para no tener que tocar codigo al desplegar. En local, si la
| variable no esta definida, se permiten los puertos habituales de ng serve.
|
*/

$origenes = array_values(array_filter(array_map(
    'trim',
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))
)));

if ($origenes === []) {
    $origenes = [
        'http://localhost:4200',
        'http://127.0.0.1:4200',
    ];
}

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => $origenes,

    // Sin patrones comodin: con supports_credentials activo, un patron
    // demasiado amplio deja que cualquier host reflejado reciba respuestas.
    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Accept', 'Authorization', 'Content-Type', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 3600,

    // La autenticacion es por Bearer token (Sanctum stateless), no por
    // cookie de sesion, asi que no hacen falta credenciales cruzadas.
    'supports_credentials' => false,
];

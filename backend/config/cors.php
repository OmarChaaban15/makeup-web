<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:4200',
        'http://127.0.0.1:4200',
        'http://0.0.0.0:4200',
        'https://localhost:4200',
        'https://127.0.0.1:4200',
        'https://0.0.0.0:4200',
    ],

    'allowed_origins_patterns' => [
        '^https?://(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)(:\\d+)?$',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
# Stack Laravel 13 + Angular 21 + MySQL — Guía de instalación en Ubuntu

Stack tecnológico completo sin Docker para desarrollo local en Ubuntu.

| Capa | Tecnología |
|---|---|
| Backend | Laravel 13 · PHP 8.4 |
| Frontend | Angular 21 · TypeScript 5 · Tailwind CSS 4 |
| Base de datos | MySQL 8 |

---

## Requisitos previos

- Ubuntu 22.04 o superior
- Acceso a terminal con permisos sudo

---

## 1. Actualizar el sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git unzip wget software-properties-common apt-transport-https ca-certificates
```

---

## 2. PHP 8.4

```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

sudo apt install -y php8.4 php8.4-fpm php8.4-cli php8.4-common \
  php8.4-mysql php8.4-xml php8.4-mbstring php8.4-curl \
  php8.4-zip php8.4-bcmath php8.4-gd php8.4-tokenizer

php -v
```

---

## 3. Composer

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer --version
```

---

## 4. MySQL 8

```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
# Importante poner la contraseña que queramos al usuario root, que posteriormente la usaremos en el .env
sudo mysql_secure_installation
```

### Crear base de datos y usuario

```bash
sudo mysql
```

```sql
CREATE DATABASE makeupweb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON makeupweb.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Solución al error de autenticación root en Ubuntu

En Ubuntu, MySQL usa `auth_socket` para root por defecto. Si necesitas conectarte con contraseña:

```bash
sudo mysql
```

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'tu_contraseña';
FLUSH PRIVILEGES;
EXIT;
```

---

## 5. Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

node -v
npm -v
```

---

## 6. Angular CLI 21

```bash
sudo npm install -g @angular/cli@21
ng version
```

---

## 7. Proyecto Laravel 13

```bash
composer create-project laravel/laravel backend "^13"
cd backend
# Importante usar un .env personalizado a partir del ejemplo
cp .env.example .env
php artisan key:generate
```

### Configurar `.env`

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=makeupweb
DB_USERNAME=root
DB_PASSWORD=tu_contraseña
```

### Ejecutar migraciones

```bash
php artisan migrate
```

### Configurar CORS — `config/cors.php`

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:4200'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

```bash
php artisan config:clear
php artisan cache:clear
```

### Arrancar servidor de desarrollo

```bash
php artisan serve
# http://localhost:8000
```

---

## 8. Proyecto Angular 21

Desde la carpeta raíz del proyecto, en otra terminal:

```bash
ng new frontend --style=css --routing=true --ssr=false
cd frontend
```

---

## 9. Tailwind CSS 4

```bash
npm install tailwindcss @tailwindcss/vite
```

### Configurar `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})
```

### Configurar `src/styles.css`

```css
@import "tailwindcss";
```

### Arrancar servidor de desarrollo

```bash
ng serve
# http://localhost:4200
```

---

## 10. Conectar Angular con Laravel

### `src/environments/environment.ts`

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

---

## Servicios activos

| Servicio | Comando | URL |
|---|---|---|
| Laravel | `php artisan serve` | http://localhost:8000 |
| Angular | `ng serve` | http://localhost:4200 |
| MySQL | servicio del sistema | localhost:3306 |

---

## Comandos útiles de MySQL

```bash
# Conectarse a MySQL
mysql -u appuser -p miapp

# Backup
mysqldump -u appuser -papppass miapp > backup.sql

# Restaurar
mysql -u appuser -papppass miapp < backup.sql
```

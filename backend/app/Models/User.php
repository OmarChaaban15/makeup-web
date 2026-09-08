<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\RestablecerPassword;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'phone', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * El enlace de recuperacion debe apuntar al SPA de Angular,
     * no a una ruta web de Laravel (que no existe en este proyecto).
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new RestablecerPassword($token));
    }

    public function accesosTutorial()
    {
        return $this->hasMany(AccesoTutorial::class);
    }

    public function pedidos()
    {
        return $this->hasMany(Pedido::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cita extends Model
{
    public $timestamps = false;
    protected $table = 'citas';
    protected $fillable = [
        'user_id', 'servicio_id', 'fecha_hora',
        'nombre_cliente', 'email_cliente', 'telefono_cliente',
        'notas', 'estado'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }
}
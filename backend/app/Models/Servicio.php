<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    public $timestamps = false;
    protected $table = 'servicios';
    protected $fillable = [
        'categoria_id', 'nombre', 'descripcion',
        'precio', 'duracion_min', 'imagen_url', 'activo'
    ];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function citas()
    {
        return $this->hasMany(Cita::class, 'servicio_id');
    }

    public function resenas()
    {
        return $this->hasMany(Resena::class, 'servicio_id');
    }
}
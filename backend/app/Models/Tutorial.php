<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tutorial extends Model
{
    public $timestamps = false;
    protected $table = 'tutoriales';
    protected $fillable = [
        'categoria_id', 'titulo', 'descripcion_corta', 'descripcion_larga',
        'precio', 'video_url', 'miniatura_url', 'nivel', 'activo'
    ];

    // video_url solo se devuelve si el usuario tiene acceso
    protected $hidden = ['video_url'];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function accesos()
    {
        return $this->hasMany(AccesoTutorial::class, 'tutorial_id');
    }

    public function resenas()
    {
        return $this->hasMany(Resena::class, 'tutorial_id');
    }
}
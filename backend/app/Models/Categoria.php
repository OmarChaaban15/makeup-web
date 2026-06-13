<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    public $timestamps = false;
    protected $table = 'categorias';
    protected $fillable = ['nombre', 'slug', 'descripcion'];

    public function servicios()
    {
        return $this->hasMany(Servicio::class, 'categoria_id');
    }

    public function tutoriales()
    {
        return $this->hasMany(Tutorial::class, 'categoria_id');
    }
}
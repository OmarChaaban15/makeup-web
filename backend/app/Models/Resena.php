<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resena extends Model
{
    public $timestamps = false;
    protected $table = 'resenas';
    protected $fillable = [
        'user_id', 'servicio_id', 'tutorial_id',
        'puntuacion', 'comentario', 'aprobada'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }

    public function tutorial()
    {
        return $this->belongsTo(Tutorial::class, 'tutorial_id');
    }
}
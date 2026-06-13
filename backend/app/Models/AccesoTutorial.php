<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccesoTutorial extends Model
{
    public $timestamps = false;
    protected $table = 'accesos_tutorial';
    protected $fillable = ['user_id', 'tutorial_id', 'pedido_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tutorial()
    {
        return $this->belongsTo(Tutorial::class, 'tutorial_id');
    }
}
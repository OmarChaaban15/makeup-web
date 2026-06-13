<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    public $timestamps = false;
    protected $table = 'pedidos';
    protected $fillable = [
        'user_id', 'estado', 'total',
        'metodo_pago', 'referencia_pago'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(PedidoItem::class, 'pedido_id');
    }
}
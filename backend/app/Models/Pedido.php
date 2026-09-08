<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    public $timestamps = false;
    protected $table = 'pedidos';
    protected $fillable = [
        'user_id', 'email_cliente', 'nombre_cliente',
        'estado', 'total',
        'metodo_pago', 'referencia_pago', 'actualizado_en'
    ];

    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
            'creado_en' => 'datetime',
            'actualizado_en' => 'datetime',
        ];
    }

    /** Correo al que responder: el de la cuenta si existe, o el del pedido de invitado. */
    public function emailContacto(): ?string
    {
        return $this->user?->email ?? $this->email_cliente;
    }

    public function nombreContacto(): string
    {
        return $this->user?->name ?? ($this->nombre_cliente ?: 'Cliente');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(PedidoItem::class, 'pedido_id');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class AccesoTutorial extends Model
{
    public $timestamps = false;

    protected $table = 'accesos_tutorial';

    protected $fillable = [
        'user_id', 'tutorial_id', 'pedido_id',
        'expira_en', 'aviso_expiracion_enviado_en',
    ];

    protected function casts(): array
    {
        return [
            'concedido_en' => 'datetime',
            'expira_en' => 'datetime',
            'aviso_expiracion_enviado_en' => 'datetime',
        ];
    }

    /**
     * Accesos que siguen dando derecho a ver el curso.
     *
     * expira_en null = sin caducidad. Es lo que tienen los accesos
     * concedidos antes de introducir los 6 meses, y se respeta porque en su
     * momento se vendieron asi.
     */
    public function scopeVigentes(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->whereNull('expira_en')->orWhere('expira_en', '>', now());
        });
    }

    public function scopeCaducados(Builder $query): Builder
    {
        return $query->whereNotNull('expira_en')->where('expira_en', '<=', now());
    }

    public function estaVigente(): bool
    {
        return $this->expira_en === null || $this->expira_en->isFuture();
    }

    public function diasRestantes(): ?int
    {
        if ($this->expira_en === null) {
            return null;
        }

        return max(0, (int) now()->diffInDays($this->expira_en, false));
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tutorial()
    {
        return $this->belongsTo(Tutorial::class, 'tutorial_id');
    }

    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'pedido_id');
    }
}

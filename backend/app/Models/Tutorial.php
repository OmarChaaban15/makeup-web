<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Tutorial extends Model
{
    public $timestamps = false;

    protected $table = 'tutoriales';

    protected $fillable = [
        'categoria_id', 'titulo', 'descripcion_corta', 'descripcion_larga',
        'precio', 'video_url', 'miniatura_url', 'nivel', 'activo',
        'stripe_price_id', 'precio_oferta', 'stripe_price_id_oferta',
        'oferta_inicio', 'oferta_fin', 'duracion_acceso_meses',
    ];

    // video_url solo se devuelve si el usuario tiene acceso. Los identificadores
    // de Stripe no tienen por que salir nunca en la API publica.
    protected $hidden = ['video_url', 'stripe_price_id', 'stripe_price_id_oferta'];

    /**
     * Lo que la API expone ademas de las columnas: el precio que se va a
     * cobrar de verdad y el estado de la oferta. El frontend no calcula
     * precios, solo los muestra.
     */
    protected $appends = ['precio_efectivo', 'oferta_activa', 'oferta_segundos_restantes'];

    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
            'precio_oferta' => 'decimal:2',
            'oferta_inicio' => 'datetime',
            'oferta_fin' => 'datetime',
            'activo' => 'boolean',
            'duracion_acceso_meses' => 'integer',
        ];
    }

    /**
     * True mientras la promocion esta viva.
     *
     * Se compara con la hora del servidor a proposito: el reloj del
     * navegador se puede cambiar, y de esto depende lo que se cobra.
     *
     * El nombre no puede ser ofertaActiva(): ese identificador lo ocupa el
     * accesor del atributo "oferta_activa" que expone la API.
     */
    public function tieneOfertaActiva(): bool
    {
        if ($this->precio_oferta === null || $this->stripe_price_id_oferta === null) {
            return false;
        }

        $ahora = now();
        $inicio = $this->oferta_inicio ? \Carbon\Carbon::parse($this->getRawOriginal('oferta_inicio'), 'UTC') : null;
        $fin = $this->oferta_fin ? \Carbon\Carbon::parse($this->getRawOriginal('oferta_fin'), 'UTC') : null;

        if ($inicio && $ahora->lt($inicio)) {
            return false;
        }

        if ($fin && $ahora->gte($fin)) {
            return false;
        }

        return true;
    }

    protected function ofertaActiva(): Attribute
    {
        return Attribute::get(fn () => $this->tieneOfertaActiva());
    }

    /** Importe que se va a cobrar ahora mismo. */
    protected function precioEfectivo(): Attribute
    {
        return Attribute::get(fn () => $this->tieneOfertaActiva()
            ? $this->precio_oferta
            : $this->precio);
    }

    /**
     * Segundos que le quedan a la oferta, o null si no hay ninguna activa.
     *
     * El servidor manda una duracion, no una fecha limite, para que el
     * contador del navegador no dependa de que su reloj este en hora:
     * descuenta desde este numero y ya esta.
     */
    protected function ofertaSegundosRestantes(): Attribute
    {
        return Attribute::get(function () {
            if (! $this->tieneOfertaActiva() || ! $this->oferta_fin) {
                return null;
            }

            // Carbon 3 devuelve float en diffInSeconds; al frontend le va
            // mejor un entero.
            return max(0, (int) now()->diffInSeconds($this->oferta_fin, false));
        });
    }

    /** Price de Stripe correspondiente al importe vigente. */
    public function stripePriceIdEfectivo(): ?string
    {
        return $this->tieneOfertaActiva()
            ? $this->stripe_price_id_oferta
            : $this->stripe_price_id;
    }

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

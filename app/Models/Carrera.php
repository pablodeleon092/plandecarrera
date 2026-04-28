<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Carrera extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var string[]
     */
    protected $fillable = [
        'nombre',
        'instituto_id',
        'modalidad',
        'sede',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string,string>
     */
    protected $casts = [
        'nombre' => 'string',
        'instituto_id' => 'integer',
        'modalidad' => 'string',
        'sede' => 'string',
    ];

    /**
     * Get the instituto that owns the carrera.
     */
    public function instituto()
    {
        return $this->belongsTo(Instituto::class, 'instituto_id');
    }

    public function planes()
    {
        return $this->hasMany(Plan::class, 'carrera_id');
    }

    public function planActual()
    {
        return $this->hasOne(Plan::class, 'carrera_id')
            ->where(function ($query) {
                $query->whereNull('anio_fin')
                    ->orWhere('anio_fin', '>', now()); // Planes que vencen después de hoy (exactamente)
            })
            // 1. Los que son NULL primero (vigencia indefinida)
            ->orderByRaw('anio_fin IS NULL DESC') 
            // 2. Si ambos tienen fecha, el que termine más lejos en el futuro
            ->orderBy('anio_fin', 'desc') 
            ->orderBy('anio_comienzo', 'desc');
    }
        
}

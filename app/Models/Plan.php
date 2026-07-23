<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'carrera_id',
        'nombre',
        'codigo',
        'anio_comienzo',
        'anio_fin',
    ];

    protected $table = 'planes';
    /**
     * Get the instituto that owns the carrera.
     */
    public function carrera()
    {
        return $this->belongsTo(Carrera::class, 'carrera_id');
    }

    public function materias()
    {
        return $this->belongsToMany(Materia::class, 'plan_materia')
                    ->withPivot('anio'); // <--- CRÍTICO: Esto permite cargar el campo extra
    }
}

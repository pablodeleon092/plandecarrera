<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Materia extends Model
{

    use HasFactory;

    protected $table = 'materias';



    protected $fillable = [
        'nombre',
        'codigo',
        'estado',
        'regimen',
        'cuatrimestre',
        'horas_semanales',
        'horas_totales',
        'id_plan'
    ];

    protected $casts = [
        'estado' => 'boolean',
        'cuatrimestre' => 'integer',
        'horas_semanales' => 'integer',
        'horas_totales' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    //Relacion con Plan

    public function planes()
    {
        return $this->belongsToMany(Plan::class, 'plan_materia', 'materia_id', 'plan_id');
    }

    //Relacion con las Comisiones

    public function comisiones()
    {
        return $this->hasMany(Comision::class, 'id_materia');
    }

    //Accessors y Mutators

    /**
     * Obtener el nombre del régimen en formato legible
     */
    public function getRegimenNombreAttribute(): string
    {
        return $this->regimen === 'anual' ? 'Anual' : 'Cuatrimestral';
    }

    /**
     * Obtener el estado en formato legible
     */
    public function getEstadoNombreAttribute(): string
    {
        return $this->estado ? 'Activo' : 'Inactivo';
    }

    /**
     * Calcular horas totales automáticamente
     * Esto se puede usar antes de guardar
     */
    public function calcularHorasTotales(): void
    {
        if ($this->regimen === 'anual') {
            // Anual: aproximadamente 32 semanas
            $this->horas_totales = $this->horas_semanales * 32;
        } else {
            // Cuatrimestral: aproximadamente 16 semanas
            $this->horas_totales = $this->horas_semanales * 16;
        }
    }

    // Scopes (consultas reutilizables)

    public function scopeByInstituto($query, $institutoId)
    {
        return $query->whereHas('planes.carrera', function ($q) use ($institutoId) {
            $q->where('instituto_id', $institutoId);
        });
    }

    /**
     * Scope para filtrar materias por un array de Carrera IDs.
     */
    public function scopeByCarreras($query, array $carreraIds)
    {
        return $query->whereHas('planes', function ($q) use ($carreraIds) {
            $q->whereIn('carrera_id', $carreraIds);
        });
    }

    /**
     * Scope para materias activas
     */
    public function scopeActivas($query)
    {
        return $query->where('estado', true);
    }

    /**
     * Scope para materias por régimen
     */
    public function scopePorRegimen($query, string $regimen)
    {
        return $query->where('regimen', $regimen);
    }

    /**
     * Scope para materias de un cuatrimestre específico
     */
    public function scopePorCuatrimestre($query, int $cuatrimestre)
    {
        return $query->where('cuatrimestre', $cuatrimestre);
    }

    // Métodos auxiliares

    /**
     * Verificar si la materia es anual
     */
    public function esAnual(): bool
    {
        return $this->regimen === 'anual';
    }

    /**
     * Verificar si la materia es cuatrimestral
     */
    public function esCuatrimestral(): bool
    {
        return $this->regimen === 'cuatrimestral';
    }

    /**
     * Verificar si la materia está activa
     */
    public function estaActiva(): bool
    {
        return $this->estado === true;
    }


}

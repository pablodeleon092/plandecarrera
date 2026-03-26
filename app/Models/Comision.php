<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Comision extends Model
{
    use HasFactory;
    protected $table = 'comisiones';

    protected $fillable = [
        'id',
        'codigo',
        'nombre',
        'turno',
        'modalidad',
        'sede',
        'anio',
        'cuatrimestre',
        'horas_teoricas',
        'horas_practicas',
        'horas_totales',
        'id_materia',
        'estado', // <-- AGREGALO
    ];

    protected $attributes = [
        'estado' => true, // ahora sí, seguro
    ];

    protected $appends = ['docentes_with_cargo', 'docentes_names_by_cargo'];

    public function materia()
    {
        return $this->belongsTo(Materia::class, 'id_materia');
    }

    public function docentes()
    {
        return $this->belongsToMany(Docente::class, 'dictas', 'comision_id', 'docente_id')
                    ->withPivot('cargo_id', 'ano_inicio', 'año_fin', 'modalidad_presencia', 'horas_frente_aula', 'funcion_aulica_id')
                    ->withTimestamps();
    }

    public function dictas()
    {
        return $this->hasMany(Dicta::class, 'comision_id');
    } 

    public function horarios()
    {
        return $this->hasMany(Horario::class, 'comision_id');
    }

    public function getDocentesWithCargoAttribute()
    {
        // 1. Verificar si la relación 'dictas' ya fue cargada eagerly
        if ($this->relationLoaded('dictas')) {
            $dictas = $this->dictas; // Usar la relación cargada
        } else {
            // 2. Si no fue cargada, forzar la carga (esto dispara la consulta N+1, pero es el fallback)
            $dictas = $this->dictas()->with(['docente', 'cargo'])->get();
        }
        
        // 3. Mapear la colección, asegurándonos que 'docente' y 'cargo' existen
        return $dictas->map(function($dicta) {
            // Usamos null coalescing para evitar errores si las sub-relaciones no existen
            $docenteNombre = $dicta->docente->nombre ?? 'N/A';
            $docenteApellido = $dicta->docente->apellido ?? 'N/A';
            
            return [
                'id' => $dicta->docente->id ?? null,
                'dicta_id' => $dicta->id,
                'nombre' => $docenteNombre,
                'apellido' => $docenteApellido,
                'cargo' => $dicta->cargo->nombre ?? null,
                'ano_inicio' => $dicta->ano_inicio,
                'año_fin' => $dicta->año_fin,
                'modalidad_presencia' => $dicta->modalidad_presencia,
                'horas_frente_aula' => $dicta->horas_frente_aula,
                'funcion_aulica' => $dicta->funcionAulica->nombre ?? null,
            ];
        });
    }

    public function getDocentesNamesByCargoAttribute()
    {
        $docentesWithCargo = $this->docentes_with_cargo; 
        $docentesCollection = collect($docentesWithCargo);

        $namesByCargo = [
            'Titular' => collect(),
            'Asociado' => collect(),
            'Adjunto' => collect(),
            'Jefe de Trabajos Practicos' => collect(),
            'Ayudante de Primera' => collect(),
        ];
    
        $uniqueDocentes = $docentesCollection->unique('id');

        foreach ($uniqueDocentes as $docente) {
            $cargoName = $docente['cargo'];
            $fullName = $docente['nombre'] . ' ' . $docente['apellido'];

            
            if ($cargoName && $cargoName === 'Titular') {
                $namesByCargo['Titular']->push($fullName);
            } elseif ($cargoName && $cargoName === 'Asociado') {
                $namesByCargo['Asociado']->push($fullName);
            } elseif ($cargoName && $cargoName === 'Adjunto') {
                $namesByCargo['Adjunto']->push($fullName);
            } elseif ($cargoName && $cargoName === 'Jefe de Trabajos Practicos') {
                $namesByCargo['Jefe de Trabajos Practicos']->push($fullName);
            } elseif ($cargoName && $cargoName === 'Ayudante de Primera') {
                $namesByCargo['Ayudante de Primera']->push($fullName);
            }
        }

        

        return [
            'totalDocentes' => $uniqueDocentes->count(),
            'names' => [
                'Titular' => $namesByCargo['Titular']->toArray(),
                'Asociado' => $namesByCargo['Asociado']->toArray(),
                'Adjunto' => $namesByCargo['Adjunto']->toArray(),
                'Jefe de Trabajos Practicos' => $namesByCargo['Jefe de Trabajos Practicos']->toArray(),
                'Ayudante de Primera' => $namesByCargo['Ayudante de Primera']->toArray(),
            ]
        ];

    }

    public function scopeByInstituto($query, $institutoId)
    {
        return $query->whereHas('materia', function ($q) use ($institutoId) {
            // Invoca el scope 'ByInstituto' del modelo Materia
            $q->byInstituto($institutoId);
        });
    }

    /**
     * Scope para filtrar comisiones por un array de Carrera IDs.
     * Sigue la relación a Materia y usa la lógica de planes de la materia.
     */
    public function scopeByCarreras($query, array $carreraIds)
    {
        return $query->whereHas('materia', function ($q) use ($carreraIds) {
            // Invoca el scope 'ByCarreras' del modelo Materia
            $q->byCarreras($carreraIds);
        });
    }

    public function scopeByCarrera($query, $carreraId)
    {
        return $query->whereHas('materia', function ($q) use ($carreraId) {
            // Invoca el scope 'ByCarreras' del modelo Materia
            $q->byCarrera ($carreraIds);
        });
    }

    public function estaCompleta()
    {
        // Cargamos los nombres de los cargos de los dictas asociados
        $cargos = $this->dictas->map(fn($d) => strtolower($d->cargo->nombre ?? ''));

        // 1. Verificar Responsable (Titular o Adjunto)
        $tieneResponsable = $cargos->contains(fn($c) => 
            str_contains($c, 'titular') || str_contains($c, 'adjunto')
        );
        
        // 2. Verificar Auxiliar (JTP o Ayudante)
        $tieneAuxiliar = $cargos->contains(fn($c) => 
            str_contains($c, 'jefe de trabajos') || str_contains($c, 'ayudante')
        );

        return $tieneResponsable && $tieneAuxiliar;
    }

}

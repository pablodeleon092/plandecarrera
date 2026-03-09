<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Docente extends Model
{
    use HasFactory;

    /**
     * Estos campos son seguros para ser llenados mediante Docente::create().
     */
    protected $fillable = [
        'legajo',
        'nombre',
        'apellido',
        'modalidad_desempeño',
        'carga_horaria',
        'es_activo',
        'telefono',
        'email',
    ];

    protected $appends = ['nombre_completo'];

    protected $table = 'docentes';

    // Relación con Cargos
    public function cargos()
    {
        return $this->hasMany(Cargo::class, 'docente_id');
    }

    // Relación con Dictas
    public function dictas()
    {
        return $this->hasMany(Dicta::class, 'docente_id');
    }

    // --- NUEVA RELACIÓN AGREGADA (Soluciona el error 500) ---
    public function comisiones()
    {

        // Parámetros: Modelo Destino, Tabla Pivot, FK Local, FK Foránea
        return $this->belongsToMany(Comision::class, 'dictas', 'docente_id', 'comision_id')
            ->withPivot('id'); // Opcional:
        //  trae el ID de la relación dicta
    }

    public function scopeDeInstitutoYCarrera($query, $institutoId, $carreraId)
    {
        return $query->whereHas('comisiones.materia.planes', function ($q) use ($institutoId, $carreraId) {

            $q->whereNull('anio_fin')               // plan activo
                ->where('carrera_id', $carreraId)     // misma carrera
                ->whereHas('carrera', function ($c) use ($institutoId) {
                    $c->where('instituto_id', $institutoId); // instituto al que pertenece la carrera
                });

        });
    }

    public function scopeDeInstituto($query, $institutoId)
    {
        return $query->whereHas('comisiones.materia.planes', function ($q) use ($institutoId) {

            $q->whereNull('anio_fin') // solo planes activos
                ->whereHas('carrera', function ($c) use ($institutoId) {
                    $c->where('instituto_id', $institutoId);
                });

        });
    }

    public function getNombreCompletoAttribute()
    {
        return "{$this->nombre} {$this->apellido}";
    }

}
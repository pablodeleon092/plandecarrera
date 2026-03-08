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

    protected $table = 'docentes'; 

    // Relación con Cargos
    public function cargos()
    {
        return $this->hasMany(Cargo::class, 'docente_id');
    }

    // --- NUEVA RELACIÓN AGREGADA (Soluciona el error 500) ---
    public function comisiones()
    {
        // Asumiendo que la tabla intermedia se llama 'dictas' (por tu DictaController)
        // Parámetros: Modelo Destino, Tabla Pivot, FK Local, FK Foránea
        return $this->belongsToMany(Comision::class, 'dictas', 'docente_id', 'comision_id')
                    ->withPivot('id'); // Opcional: trae el ID de la relación dicta
    }
    public function dictas()
    {
        // Esto es lo que busca el controlador cuando hace whereHas('dictas')
        return $this->hasMany(Dicta::class, 'docente_id');
    }

}
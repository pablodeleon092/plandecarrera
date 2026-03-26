<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Horario extends Model
{
    protected $fillable = [
        'id',
        'comision_id',
        'dia_semana',
        'hora_inicio',
        'hora_fin',
        'aula'
    ]; 



    public function comision()
    {
        return $this->belongsTo(Comision::class, 'comision_id');
    }

}

<?php

namespace Database\Seeders;

use App\Models\Cargo;
use App\Models\Docente;
use App\Models\Dedicacion;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CargosSeeder extends Seeder
{
    public function run()
    {
        $cargosDisponibles = [
            'Titular',
            'Asociado',
            'Adjunto',
            'Jefe de Trabajos Practicos',
            'Ayudante de Primera',
        ];

        $docentes = Docente::all();

        foreach ($docentes as $docente) {

            if ($docente->modalidad_desempeño === 'Desarrollo') {
                $dedicaciones = Dedicacion::whereIn('nombre', ['Simple', 'SemiExclusiva(DP)'])->get();
            } elseif ($docente->modalidad_desempeño === 'Investigador') {
                $dedicaciones = Dedicacion::whereIn('nombre', ['SemiExclusiva(DI)', 'Exclusiva'])->get();
            } 

            $dedicacion = $dedicaciones->random();


            $nombreCargo = $cargosDisponibles[array_rand($cargosDisponibles)];
            Cargo::firstOrCreate(
                [
                    'docente_id' => $docente->id,
                    'nombre' => $nombreCargo,
                ],
                [
                    'dedicacion_id' => $dedicacion->id,
                    'nro_materias_asig' => 0,
                    'sum_horas_frente_aula' => 0,
                ]
            );
        }
    }
}
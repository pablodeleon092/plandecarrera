<?php

namespace Database\Seeders;

use App\Models\Comision;
use App\Models\Materia;
use Illuminate\Database\Seeder;

class ComisionesSeeder extends Seeder
{
    public function run()
    {
        $materias = Materia::all();

        foreach ($materias as $materia) {
         
            $horasTeoricas = rand(1, $materia->horas_semanales - 1);
            $horasPracticas = $materia->horas_semanales - $horasTeoricas;

            $codigoComision = strtoupper($materia->codigo) . '-' . rand(100, 999);
            Comision::updateOrCreate(
                ['codigo' => $codigoComision],
                [
                    'nombre' => 'Comisión ' . $materia->nombre,
                    'turno' => rand(0, 1) ? 'mañana' : 'tarde',
                    'modalidad' => collect(['presencial', 'virtual', 'mixta'])->random(),
                    'sede' => collect(['Ushuaia', 'Rio Grande', 'Ushuaia/Rio Grande'])->random(),
                    'anio' => (int) date('Y'),
                    'cuatrimestre' => rand(0, 1) ? '1ro' : '2do',
                    'horas_teoricas' => $horasTeoricas,
                    'horas_practicas' => $horasPracticas,
                    'horas_totales' => $horasTeoricas + $horasPracticas,
                    'estado' => true,
                    'id_materia' => $materia->id,
                ]
            );
        }
    }
}

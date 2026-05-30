<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Dicta;
use App\Models\Comision;
use App\Models\Docente;
use App\Models\FuncionAulica;
use App\Services\NormativaAsignacion;

class DictasSeeder extends Seeder
{
    public function run()
    {
        $comisiones = Comision::all();
        $docentes = Docente::with('cargos')->get(); // Cargamos cargos de una vez
        $funcionesAulicas = FuncionAulica::all();

        if ($docentes->isEmpty()) {
            $this->command->info('No hay docentes cargados.');
            return;
        }

        foreach ($comisiones as $comision) {
            // Asignar entre 1 y 3 docentes por comisión
            $cantidadDocentes = rand(1, 3);

            // Docentes aleatorios
            $docentesAsignados = $docentes->random(
                min($cantidadDocentes, $docentes->count())
            );

            foreach ($docentesAsignados as $docente) {

                // Asegurar que el docente tiene al menos un cargo
                if ($docente->cargos->isEmpty()) {
                    $this->command->warn("El docente {$docente->id} no tiene cargos. Se omite.");
                    continue;
                }

                $cargoId = $docente->cargos->random()->id;
                $dicta = Dicta::firstOrCreate(
                    [
                        'comision_id' => $comision->id,
                        'docente_id'  => $docente->id,
                        'cargo_id'    => $cargoId,
                    ],
                    [
                        'ano_inicio'  => '2025-03-01',
                        'año_fin'     => null,
                        'modalidad_presencia' => collect(['presencial', 'virtual', 'mixta'])->random(),
                        'horas_frente_aula'   => rand(2, 6),
                        'funcion_aulica_id'   => $funcionesAulicas->isNotEmpty() ? $funcionesAulicas->random()->id : null,
                    ]
                );

                NormativaAsignacion::recalcularCargo($dicta->docente, $dicta->cargo);

                NormativaAsignacion::recalcularCargaHorariaDocente($dicta->docente);
            }
        }
    }
}

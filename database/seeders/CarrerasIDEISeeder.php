<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CarrerasIDEISeeder extends Seeder
{
    public function run()
    {
        $carreras = [
            [
                'nombre' => 'Licenciatura en Administración Pública',
                'instituto_id' => 3,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia/Rio Grande',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Contador Público',
                'instituto_id' => 3,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia/Rio Grande',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Ingeniería Industrial',
                'instituto_id' => 3,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Licenciatura en Economía',
                'instituto_id' => 3,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia/Rio Grande',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Licenciatura en Gestión Empresarial',
                'instituto_id' => 3,
                'modalidad' => 'presencial',
                'sede' => 'Rio Grande',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Licenciatura en Turismo',
                'instituto_id' => 3,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Licenciatura en Sistemas',
                'instituto_id' => 3,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ];

        foreach ($carreras as $carrera) {
            DB::table('carreras')->updateOrInsert(
                ['nombre' => $carrera['nombre'], 'instituto_id' => $carrera['instituto_id']],
                $carrera
            );
        }
    }
}

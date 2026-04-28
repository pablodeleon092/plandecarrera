<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CarrerasIecSeeder extends Seeder
{
    public function run()
    {
        $carreras = [
            [
                'nombre' => 'Licenciatura en Educación Primaria',
                'instituto_id' => 4,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia/Rio Grande',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Licenciatura en Gestión Educativa',
                'instituto_id' => 4,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia/Rio Grande',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Especialización en ENSEÑANZA DE LA BIOLOGÍA',
                'instituto_id' => 4,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Especialización en Enseñanza de la Lengua y la Literatura',
                'instituto_id' => 4,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Especialización en Enseñanza de la Matemática',
                'instituto_id' => 4,
                'modalidad' => 'presencial',
                'sede' => 'Rio Grande',
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

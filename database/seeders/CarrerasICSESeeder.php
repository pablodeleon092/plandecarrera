<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CarrerasICSESeeder extends Seeder
{
    public function run()
    {
        $carreras = [
            [
                'nombre' => 'Licenciatura en Ciencia Política',
                'instituto_id' => 2,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia/Rio Grande',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Licenciatura en Medios Audiovisuales',
                'instituto_id' => 2,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia/Rio Grande',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Licenciatura en Sociología',
                'instituto_id' => 2,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia/Rio Grande',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Licenciatura en Seguridad Pública',
                'instituto_id' => 2,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia/Rio Grande',
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

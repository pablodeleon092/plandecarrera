<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CarrerasICPASeeder2 extends Seeder
{
    public function run()
    {
        $carreras = [
            [
                'nombre' => 'Licenciatura en Biología',
                'instituto_id' => 1,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Licenciatura en Ciencias Ambientales',
                'instituto_id' => 1,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Licenciatura en Geología',
                'instituto_id' => 1,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'nombre' => 'Ingeniería en Agroecología',
                'instituto_id' => 1,
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


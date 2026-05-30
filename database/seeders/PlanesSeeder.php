<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PlanesSeeder extends Seeder
{
    public function run()
    {
        // Obtener todos los IDs de las carreras
        $carreras = DB::table('carreras')->pluck('id');

        $planes = [];

        foreach ($carreras as $carrera_id) {
            DB::table('planes')->updateOrInsert(
                ['carrera_id' => $carrera_id],
                [
                    'anio_comienzo' => Carbon::create(2020, 1, 1),
                    'anio_fin' => null,
                    'updated_at' => Carbon::now(),
                    'created_at' => Carbon::now(),
                ]
            );
        }
    }
}

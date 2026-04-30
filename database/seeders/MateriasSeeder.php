<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Materia;
use App\Models\Plan; // Modelo Plan
use Illuminate\Support\Facades\DB;

class MateriasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create();

        // Obtener todos los planes activos (anio_fin = null)
        $planesActivos = Plan::whereNull('anio_fin')->get();

        for ($i = 0; $i < 100; $i++) {

            $regimen = $faker->randomElement(['anual', 'cuatrimestral']);
            $horas_semanales = $faker->numberBetween(2, 10);

            $horas_totales = $regimen === 'cuatrimestral'
                ? $horas_semanales * 16
                : $horas_semanales * 32;

            $cuatrimestre = $regimen === 'cuatrimestral'
                ? $faker->numberBetween(1, 12)
                : $faker->numberBetween(1, 6);

            // Crear la materia
            $materia = Materia::create([
                'codigo' => $faker->unique()->regexify('[A-Z]{3}[0-9]{3}'),
                'nombre' => $faker->sentence(3),
                'estado' => $faker->boolean(90),
                'regimen' => $regimen,
                'cuatrimestre' => $cuatrimestre,
                'horas_semanales' => $horas_semanales,
                'horas_totales' => $horas_totales,
            ]);

            // Asociar la materia a un plan activo al azar
            $plan = $planesActivos->random();
            DB::table('plan_materia')->insert([
                'plan_id' => $plan->id,
                'materia_id' => $materia->id,
                'anio' => $faker->numberBetween(1, 5),


            ]);
        }
    }
}

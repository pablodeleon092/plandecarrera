<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Docente;

class DocenteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtenemos una instancia de Faker para usarla en el bucle.
        $faker = \Faker\Factory::create();

        // Usamos un bucle para crear 100 docentes.
        for ($i = 0; $i < 100; $i++) {
            // En lugar de usar la factory, creamos el modelo directamente.
            // Esto evita que el generador `unique()` de la factory acumule memoria.
            $legajo = $faker->unique(true)->numberBetween(10000, 99999);
            Docente::updateOrCreate(
                ['legajo' => $legajo],
                [
                    'nombre' => $faker->firstName,
                    'apellido' => $faker->lastName,
                    'modalidad_desempeño' => $faker->randomElement(['Investigador', 'Desarrollo']),
                    'carga_horaria' => 0,
                    'es_activo' => $faker->boolean(90),
                    'telefono' => $faker->unique(true)->optional()->e164PhoneNumber,
                    'email' => $faker->unique(true)->optional()->safeEmail,
                ]
            );
        }
    }
}
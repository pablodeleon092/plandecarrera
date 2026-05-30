<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesYPermisosSeeder::class,
            InstitutosSeeder::class,
            DedicacionesSeeder::class,
            FuncionAulicaSeeder::class,
            CarrerasIDEISeeder::class,
            CarrerasIECSeeder::class,
            CarrerasICPASeeder2::class,
            CarrerasICSESeeder::class,
            DocenteSeeder::class,
            PlanesSeeder::class,
            MateriasSeeder::class,
            CargosSeeder::class,
            ComisionesSeeder::class,
            DictasSeeder::class,
            HorarioSeeder::class,
        ]);
    }
}

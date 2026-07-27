<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Instituto;
use Illuminate\Database\Seeder;

class InstitutosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $institutos = [
            ['nombre' => 'Instituto de Ciencias Polares, Ambiente y Recursos Naturales', 'siglas' => 'ICPA'],
            ['nombre' => 'Instituto de Cultura Sociedad y Estado', 'siglas' => 'ICSE'],
            ['nombre' => 'Instituto de Desarrollo Económico e Innovación', 'siglas' => 'IDEI'],
            ['nombre' => 'Instituto de la Educación y del Conocimiento', 'siglas' => 'IEC'],
        ];

        foreach ($institutos as $inst) {
            Instituto::updateOrCreate(
                ['nombre' => $inst['nombre']],
                ['siglas' => $inst['siglas']]
            );
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Comision;
use App\Models\Horario;
use Illuminate\Database\Seeder;

class HorarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $comisiones = Comision::all();

        // Si no tienes comisiones, el seeder no hará nada.
        if ($comisiones->isEmpty()) {
            $this->command->warn('No hay comisiones en la base de datos. Abortando HorarioSeeder.');
            return;
        }

        $dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

        foreach (($comisiones) as $comision) {
            // Decidimos aleatoriamente si la comisión tiene 1 o 2 días de clase por semana
            $cantidadDias = rand(1, 2);
            $diasAsignados = fake()->randomElements($dias, $cantidadDias);

            foreach ($diasAsignados as $dia) {
                // Generamos una hora de inicio entre las 08:00 y las 18:00
                $inicio = fake()->dateTimeBetween('08:00', '18:00');
                $horaInicio = $inicio->format('H:00:00');
                
                // La hora de fin será entre 2 y 4 horas después del inicio
                $horaFin = $inicio->modify('+' . rand(2, 4) . ' hours')->format('H:00:00');

                Horario::firstOrCreate(
                    [
                        'comision_id' => $comision->id,
                        'dia_semana'  => $dia,
                        'hora_inicio' => $horaInicio,
                    ],
                    [
                        'hora_fin'    => $horaFin,
                        'aula'        => 'Aula ' . fake()->numberBetween(100, 500),
                    ]
                );
            }
        }

        $this->command->info('Tabla de horarios poblada con éxito.');
    }
}
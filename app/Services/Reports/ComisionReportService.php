<?php

namespace App\Services\Reports;

class ComisionReportService extends BaseReportService {
    protected function getReportPath(): string { return 'reporte_comisiones.jrxml'; }
    protected function getParamMap(): array {
        return [
            // Texto
            'nombre'                        => 'NOMBRE',
            'codigo'                        => 'CODIGO',
            'materia.nombre'                => 'MATERIA',
            'horarios.aula'                 => 'AULA',

            // Selects / IDs
            'estado'                        => 'ESTADO',
            'turno'                         => 'TURNO',
            'modalidad'                     => 'MODALIDAD',
            'regimen'                       => 'REGIMEN',
            'horarios.dia_semana'           => 'DIA_SEMANA',
            // Números
            'anio'                          => 'ANIO',
            'horas_totales'                 => 'HORAS_TOTALES',
            'horas_teoricas'                => 'HORAS_TEORICAS',
            'horas_practicas'               => 'HORAS_PRACTICAS',

            // Tiempos
            'horarios.hora_inicio'          => 'HORA_INICIO',
            'horarios.hora_fin'             => 'HORA_FIN'
        ];
    }
}
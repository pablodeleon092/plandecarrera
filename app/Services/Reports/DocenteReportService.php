<?php

namespace App\Services\Reports;

class DocenteReportService extends BaseReportService {
    protected function getReportPath(): string { return 'reporte_docentes.jrxml'; }
    protected function getParamMap(): array {
        return [
            'carga_horaria' => 'HORAS',
            'legajo' => 'LEGAJO',
            'cargos.nombre' => 'CARGO',
            'cargos.dedicacion.id' => 'DEDICACION',
            'modalidad_desempeño' => 'MODALIDAD',
            'dictas.comision.materia.nombre' => 'MATERIA',
            'nombre' => 'NOMBRE'
        ];
    }
}
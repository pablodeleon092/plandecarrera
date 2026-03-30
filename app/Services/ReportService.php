<?php

namespace App\Services;

use PHPJasper\PHPJasper;

class ReportService
{
    public function generarDocentesPdf($request)
    {
        $jasper = new PHPJasper;
        $input = storage_path('app/reports/reporte_docentes.jrxml');
        $output = storage_path('app/reports/pdf/reporte_' . time());

        // Obtenemos el array de filtros que viene de la URL
        $filters = $request->input('filters', []);
        $params = [];

        // 2. Mapeo del array dinámico de DynamicFilters
        foreach ($filters as $f) {
            $field = $f['field'] ?? null;
            $operator = $f['operator'] ?? null;
            $value = $f['value'] ?? null;

            if (!$field || !$operator) continue;

            $paramBase = $this->getParamName($field);

            if (!empty($value) || $value === '0' || $operator === 'between') {
                
                $params["OP_{$paramBase}"] = $operator;

                if ($operator === 'between' && is_array($value)) {
                    if (!empty($value['min'])) $params["MIN_{$paramBase}"] = $value['min'];
                    if (!empty($value['max'])) $params["MAX_{$paramBase}"] = $value['max'];
                } else {
                    $params["VALOR_{$paramBase}"] = $value;
                }
            }
        } 
        #dd($params);
        $options = [
                'format' => ['pdf'],
                'locale' => 'es_AR',
                'params' => $params, 
                'db_connection' => [
                    'driver'   => 'postgres',
                    'username' => env('DB_USERNAME'),
                    'password' => env('DB_PASSWORD'),
                    'host'     => env('DB_HOST'), 
                    'database' => env('DB_DATABASE'),
                    'port'     => env('DB_PORT'),
                ]
        ];

        $jasper->process($input, $output, $options)->execute();

        return $output . '.pdf';
    }

    private function getParamName($field)
    {
        $map = [
            'carga_horaria'           => 'HORAS',
            'legajo'                  => 'LEGAJO',
            'cargos.nombre'           => 'CARGO',
            'cargos.dedicacion.id' => 'DEDICACION',
            'modalidad_desempeño'     => 'MODALIDAD',
            'dictas.comision.materia.nombre' => 'MATERIA',
            'nombre'                  => 'NOMBRE'
        ];

        return $map[$field] ?? strtoupper($field);
    }
}
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

        $params = [];

        // Solo agregamos al array si REALMENTE hay un ID
        if ($request->filled('instituto_id')) {
            $params['ID_INSTITUTO'] = (int)$request->query('instituto_id');
        }

        if ($request->filled('carrera_id')) {
            $params['ID_CARRERA'] = (int)$request->query('carrera_id');
        }

        // Para los filtros de texto (ILIKE)
        if ($request->filled('cargos')) {
            $params['FILTRO_CARGO'] = $request->query('cargos');
        }

        if ($request->filled('materia')) {
            $params['FILTRO_MATERIA'] = $request->query('materia');
        }        
        $options = [
                'format' => ['pdf'],
                'locale' => 'es_AR',
                'params' => $params, // <--- Este array ahora puede estar vacío []
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
}
<?php

namespace App\Services\Reports;

class MateriaReportService extends BaseReportService {
    
    protected function getReportPath(): string 
    { 
        return 'reporte_materias.jrxml'; 
    }

    protected function getParamMap(): array 
    {
        return [
            'nombre'           => 'NOMBRE',
            'codigo'           => 'CODIGO',
            'estado'           => 'ESTADO',
            'regimen'          => 'REGIMEN',
            'cuatrimestre'     => 'CUATRIMESTRE',
            'horas_semanales'  => 'CUATRIMESTRE', // O 'HORAS' si prefieres ese nombre en Jasper
            'by_Instituto'     => 'INSTITUTO',
            'by_Carrera'       => 'CARRERA',
        ];
    }
}
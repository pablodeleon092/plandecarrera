<?php
namespace App\Factories;

use App\Services\Reports\DocenteReportService;
use App\Services\Reports\MateriaReportService;
use App\Services\Reports\ComisionReportService;
use App\Contracts\ReportServiceInterface;
use Exception;

class ReportFactory
{
    public static function make(string $type): ReportServiceInterface
    {
        return match ($type) {
            'docentes' => new DocenteReportService(),
            'materias' => new MateriaReportService(),
            'comisiones' => new ComisionReportService(),
            default => throw new Exception("Reporte no soportado"),
        };
    }
}

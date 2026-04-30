<?php
namespace App\Services\Reports;

use Illuminate\Support\Facades\File;
use App\Contracts\ReportServiceInterface;
use PHPJasper\PHPJasper;
use Illuminate\Http\Request;

abstract class BaseReportService implements ReportServiceInterface
{
    protected $jasper;

    public function __construct() {
        $this->jasper = new PHPJasper;
    }

    // Cada reporte definirá su propio archivo .jrxml y su mapa de parámetros
    abstract protected function getReportPath(): string;
    abstract protected function getParamMap(): array;

    public function generarPdf(Request $request): string
    {
        $input = resource_path('reports/' . $this->getReportPath());

        $directory = resource_path('reports');

        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0775, true);
        }

        $output = $directory . '/reporte_' . time();

        $params = $this->parseFilters($request->input('filters', []));
        $params['logoPath'] = resource_path('img/fotoUni.jpg');

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

        $this->jasper->process($input, $output, $options)->execute();

        return $output . '.pdf';
    }

    protected function parseFilters(array $filters): array
    {
        $params = [];
        $map = $this->getParamMap();

        foreach ($filters as $f) {
            $field = $f['field'] ?? null;
            $operator = $f['operator'] ?? null;
            $value = $f['value'] ?? null;

            if (!$field || !$operator) continue;

            $paramBase = $map[$field] ?? strtoupper($field);

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

        return $params;
    }
}

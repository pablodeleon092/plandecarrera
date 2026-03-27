<?php
namespace App\Factories;

use App\Contracts\DashboardStrategy;
use App\Dashboards\ConsejeroDashboard;
use App\Dashboards\SecretariaDashboard;
use App\Dashboards\DirectorDashboard;
use App\Dashboards\CoordinadorDeCarreraDashboard;
use App\Dashboards\DefaultDashboard;
use App\Dashboards\CoordinadorAcademicoDashboard;

class DashboardFactory
{
    public static function make(?string $cargo): DashboardStrategy
    {
        return match ($cargo) {
            'Consejero'             => new ConsejeroDashboard(),
            'Secretaría académica'  => new SecretariaDashboard(),
            'Director de instituto' => new DirectorDashboard(),
            'Coordinador Academico' => new CoordinadorAcademicoDashboard(),
            'Coordinador de Carrera' => new CoordinadorDeCarreraDashboard(),
            'Administrador'          => new DefaultDashboard(),
        };
    }
}
<?php
namespace App\Factories;

use App\Contracts\DashboardStrategy;
use App\Dashboards\ConsejeroDashboard;
use App\Dashboards\SecretariaDashboard;
use App\Dashboards\DirectorDashboard;
use App\Dashboards\CoordinadorDashboard;
use App\Dashboards\DefaultDashboard;

class DashboardFactory
{
    public static function make(?string $cargo): DashboardStrategy
    {
        return match ($cargo) {
            'Consejero'             => new ConsejeroDashboard(),
            'Secretaría académica'  => new SecretariaDashboard(),
            'Director de instituto' => new DirectorDashboard(),
            'Coordinador académico' => new CoordinadorAcademicoDashboard(),
            'Coordinador de Carrera' => new CoordinadorDeCarreraDashboard(),
            'Administrador'          => new DefaultDashboard(),
        };
    }
}
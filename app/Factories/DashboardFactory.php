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
            'Consejero' => new ConsejeroDashboard(),
            'Secretaría académica', 'Administrativo de Secretaria Academica' => new SecretariaDashboard(),//agrego administrativo de secretaria academica ya que el rol "secretaria academica no esta, ver si eliminar "secretaria academica"
            'Director de instituto' => new DirectorDashboard(),
            'Coordinador academico' => new CoordinadorAcademicoDashboard(),
            'Coordinador de Carrera' => new CoordinadorDashboard(),
            'Administrador' => new DefaultDashboard(),
            default => new DefaultDashboard(),
        };
    }
}
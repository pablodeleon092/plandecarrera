<?php
namespace App\Factories;

use App\Contracts\DashboardStrategy;
use App\Dashboards\ConsejeroDashboard;
use App\Dashboards\SecretariaDashboard;
use App\Dashboards\DirectorDashboard;
use App\Dashboards\CoordinadorDeCarreraDashboard;
use App\Dashboards\DefaultDashboard;
use App\Dashboards\CoordinadorAcademicoDashboard;
use App\Dashboards\AdministrativoDeInstitutoDashboard;

class DashboardFactory
{
    public static function make(?string $userCargo, ?string $targetCargo = null): DashboardStrategy
    {
        // Si es administrador y eligió un target, usamos ese. 
        // Si no, usamos su cargo real.
        $cargoToResolve = ($userCargo === 'Administrador' && $targetCargo) 
            ? $targetCargo 
            : $userCargo;

        return match ($cargoToResolve) {
            'Consejero' => new ConsejeroDashboard(),
            'Secretaría académica', 'Administrativo de Secretaria Academica' => new SecretariaDashboard(),
            'Director de instituto', 'Director' => new DirectorDashboard(),
            'Coordinador Academico' => new CoordinadorAcademicoDashboard(),
            'Administrativo de instituto' => new AdministrativoDeInstitutoDashboard(),
            'Coordinador de Carrera' => new CoordinadorDeCarreraDashboard(),
            'Administrador' => new DefaultDashboard(),
            default => new DefaultDashboard(),
        };
    }
}
<?php
namespace App\Dashboards;

use App\Contracts\DashboardStrategy;
use App\Models\User;
use App\Services\Dashboards\DirectorDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DirectorDashboard implements DashboardStrategy
{
    public function render(User $user, Request $request): Response
    {
        $service = new DirectorDashboardService();
                
        if ($user->cargo === 'Administrador') {
            $institutoId = $request->input('instituto_id') ?? Instituto::first()?->id;
        } else {
            $institutoId = $user->instituto_id;
        }
        $data = $service->getData($institutoId);

        return Inertia::render('Gestion/DashboardDirector', $data);
    }
}

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
        $data = $service->getData($user->instituto_id);

        return Inertia::render('Gestion/DashboardDirector', $data);
    }
}

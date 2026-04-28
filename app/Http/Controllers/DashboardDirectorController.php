<?php

namespace App\Http\Controllers;

use App\Services\Dashboards\DirectorDashboardService;
use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardDirectorController extends Controller
{
    protected $dashboardService;

    public function __construct(DirectorDashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index(Request $request)
    {
        $data = $this->dashboardService->getData($request->instituto_id);

        return Inertia::render('Gestion/DashboardDirector', $data);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Materia;
use App\Models\Docente;
use App\Models\Carrera;
use App\Models\User;
use App\Factories\DashboardFactory;

class DashboardController extends Controller
{
    public function home(Request $request)
    {
        $user = Auth::user();

        // Obtenemos el cargo opcional que el administrador quiere ver
        $targetCargo = $request->query('view');

        // Pasamos tanto el cargo real como el deseado a la Factory
        $strategy = DashboardFactory::make($user->cargo, $targetCargo);

        return $strategy->render($user, $request);
    }
}
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

        // Resolvemos la estrategia según el cargo
        $strategy = DashboardFactory::make($user->cargo);

        // Ejecutamos el renderizado de esa estrategia
        return $strategy->render($user, $request);
    }
    
}
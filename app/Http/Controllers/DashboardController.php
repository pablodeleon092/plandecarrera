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

class DashboardController extends Controller
{
    public function home(Request $request)
    {
        $user = Auth::user();
        
        return match ($user->cargo) {
            'Administrador' => redirect()->route('dashboard.admin'),
            'Coordinador Academico' => redirect()->route('dashboard.coordinador'),
            default => Inertia::render('Gestion/Dashboard', ['user' => $user]),
        };
    }


    public function dashboardCoordinador(Request $request) 
    {
        $user = auth()->user();
        $institutoId = $user->instituto_id; 

        // 1. MATERIAS (Estructura: 1 Materia -> N Planes) 
        $materiasCompartidas = Materia::query()
            ->whereHas('planes.carrera', function($query) use ($institutoId) {
                $query->where('instituto_id', $institutoId);
            })
            ->with(['planes.carrera']) 
            ->get()
            ->filter(function ($materia) {
                $cantidadCarreras = $materia->planes
                    ->pluck('carrera_id')
                    ->unique()
                    ->count();
                return $cantidadCarreras > 1; 
            })
            ->map(function ($materia) {
                return [
                    'id' => $materia->id,
                    'nombre' => $materia->nombre,
                    'codigo' => $materia->codigo ?? 'S/C',
                    'carreras_nombres' => $materia->planes
                        ->map(fn($plan) => $plan->carrera->nombre ?? null)
                        ->filter()
                        ->unique()
                        ->values()
                ];
            })
            ->values();

        // 2. DOCENTES MULTI-CARRERA
        $docentesStats = Docente::whereHas('dictas', function($q) use ($institutoId) {
                $q->whereHas('comision.materia.planes.carrera', function($query) use ($institutoId) {
                    $query->where('instituto_id', $institutoId);
                });
            })
            ->withCount(['dictas as total_carreras' => function ($query) use ($institutoId) {
                $query->select(DB::raw('count(distinct(planes.carrera_id))'))
                    ->join('comisiones', 'dictas.comision_id', '=', 'comisiones.id')
                    ->join('materias', 'comisiones.id_materia', '=', 'materias.id')
                    ->join('plan_materia', 'materias.id', '=', 'plan_materia.materia_id')
                    ->join('planes', 'plan_materia.plan_id', '=', 'planes.id')
                    ->join('carreras', 'planes.carrera_id', '=', 'carreras.id')
                    ->where('carreras.instituto_id', $institutoId);
            }])
            ->get();

        $docentesMulti = $docentesStats
            ->filter(fn($d) => $d->total_carreras > 1)
            ->map(function ($docente) use ($institutoId) {
                 $nombresCarreras = DB::table('carreras')
                    ->join('planes', 'carreras.id', '=', 'planes.carrera_id')
                    ->join('plan_materia', 'planes.id', '=', 'plan_materia.plan_id')
                    ->join('materias', 'plan_materia.materia_id', '=', 'materias.id')
                    ->join('comisiones', 'materias.id', '=', 'comisiones.id_materia')
                    ->join('dictas', 'comisiones.id', '=', 'dictas.comision_id')
                    ->where('dictas.docente_id', $docente->id)
                    ->where('carreras.instituto_id', $institutoId)
                    ->distinct()
                    ->pluck('carreras.nombre');
                
                return [
                    'id' => $docente->id,
                    'nombre' => $docente->nombre,
                    'apellido' => $docente->apellido,
                    'legajo' => $docente->legajo,
                    'total_carreras' => $docente->total_carreras,
                    'email' => $docente->email,
                    'carreras_lista' => $nombresCarreras,
                ];
            })->values();


        // 3. SUPERPOSICIONES REALES POR HORARIO
        $superposicionesRaw = DB::table('dictas as d1')
        ->join('dictas as d2', function($join) {
            $join->on('d1.docente_id', '=', 'd2.docente_id')
                ->whereColumn('d1.comision_id', '<>', 'd2.comision_id')
                ->whereRaw('d1.comision_id < d2.comision_id');
        })
        ->join('comisiones as c1', 'd1.comision_id', '=', 'c1.id')
        ->join('comisiones as c2', 'd2.comision_id', '=', 'c2.id')
        ->join('horarios as h1', 'h1.comision_id', '=', 'c1.id')
        ->join('horarios as h2', 'h2.comision_id', '=', 'c2.id')
        ->join('docentes', 'd1.docente_id', '=', 'docentes.id')
        ->join('materias as m1', 'c1.id_materia', '=', 'm1.id')
        ->join('materias as m2', 'c2.id_materia', '=', 'm2.id')
        ->whereExists(function($query) use ($institutoId) {
            $query->select(DB::raw(1))
                ->from('plan_materia')
                ->join('planes', 'plan_materia.plan_id', '=', 'planes.id')
                ->join('carreras', 'planes.carrera_id', '=', 'carreras.id')
                ->whereColumn('plan_materia.materia_id', 'c1.id_materia')
                ->where('carreras.instituto_id', $institutoId);
        })
        ->where('h1.dia_semana', '=', DB::raw('h2.dia_semana'))
        ->whereRaw('h1.hora_inicio < h2.hora_fin')
        ->whereRaw('h1.hora_fin > h2.hora_inicio')
        ->select(
            'docentes.id',
            'docentes.nombre',
            'docentes.apellido',
            'c1.anio',
            'c1.cuatrimestre',
            'c1.id as comision1_id',
            'm1.nombre as materia1',
            'h1.dia_semana as dia',
            'h1.hora_inicio as inicio1',
            'h1.hora_fin as fin1',
            'c2.id as comision2_id',
            'm2.nombre as materia2',
            'h2.hora_inicio as inicio2',
            'h2.hora_fin as fin2',
        )
        ->get();

        // Agrupamos por docente
        $superposiciones = $superposicionesRaw
            ->groupBy('id')
            ->map(function($choques) {
                $primero = $choques->first();
                return [
                    'id'         => $primero->id,
                    'nombre'     => $primero->nombre,
                    'apellido'   => $primero->apellido,
                    'anio'       => $primero->anio,
                    'cuatrimestre' => $primero->cuatrimestre,
                    'cantidad_conflictos' => $choques->count(),
                    'choques'    => $choques->map(fn($c) => [
                        'dia'        => $c->dia,
                        'materia1'   => $c->materia1,
                        'inicio1'    => $c->inicio1,
                        'fin1'       => $c->fin1,
                        'comision1_id' => $c->comision1_id,
                        'materia2'   => $c->materia2,
                        'inicio2'    => $c->inicio2,
                        'fin2'       => $c->fin2,
                        'comision2_id' => $c->comision2_id,
                    ])->values(),
                ];
            })
            ->values();


        // 4. CÁLCULO TOTAL PARA EL PORCENTAJE
        $totalMateriasInstituto = Materia::whereHas('planes.carrera', function($q) use ($institutoId){
            $q->where('instituto_id', $institutoId);
        })->count();
        // ---------------------------------

        return Inertia::render('Gestion/DashboardCoordinadorV2', [
            'auth' => ['user' => $user],
            
            'metrics' => [
                'sharedPercentage' => $totalMateriasInstituto > 0 
                    ? round(($materiasCompartidas->count() / $totalMateriasInstituto) * 100, 1) 
                    : 0,
                'multiCareerTeachersCount' => $docentesMulti->count(),
                'conflictsCount' => $superposiciones->count(), 
                'totalCareers' => \App\Models\Carrera::where('instituto_id', $institutoId)->count(),
            ],

            'stats' => [
                'multiCarrera' => $docentesMulti->count(),
                'monoCarrera'  => $docentesStats->where('total_carreras', 1)->count(),
                'institutoNombre' => $user->instituto->nombre ?? 'Instituto',
                'docentesDetalle' => $docentesMulti,
                'superposicionesDetalle' => $superposiciones
            ],

            'materiasCompartidas' => [
                'list' => $materiasCompartidas
            ],
        ]);
    }
    
    public function dashboardAdmin()
    {
        return Inertia::render('Gestion/dashboardAdmin', [
            'auth' => ['user' => Auth::user()],
            'stats' => [
                'totalUsuarios' => \App\Models\User::count(),
                'totalDocentes' => \App\Models\Docente::count(),
                'totalCarreras' => \App\Models\Carrera::count(),
                'totalMaterias' => \App\Models\Materia::count(),
            ]
        ]);
    }
}
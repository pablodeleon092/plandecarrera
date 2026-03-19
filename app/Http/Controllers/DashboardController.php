<?php

namespace App\Http\Controllers;

use App\Models\Materia;
use App\Models\Instituto;
use App\Models\Carrera;
use App\Models\User;
use App\Models\Docente;
use App\Models\Dicta;
use App\Models\Comision;
use App\Services\Dashboards\ConsejeroDashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function home(Request $request)
    {
        $user = Auth::user();
        $selectedInstitutoId = $request->input('instituto_id');
        $selectedCarreraId = $request->input('carrera_id');
        $currentView = $request->input('view', 'materias'); // Default view

        // 1. Obtener Institutos disponibles
        $institutosDisponibles = $this->getInstitutosPorRol($user);

        // 2. Determinar el Instituto Seleccionado
        if (!$selectedInstitutoId) {
            $selectedInstitutoId = $institutosDisponibles->first()?->id;
        }

        // Si el usuario es Consejero, cargar dashboard ejecutivo
        if ($user->cargo === 'Consejero') {
            $service = new ConsejeroDashboardService();
            $data = $service->getData($selectedInstitutoId);
            return Inertia::render('Gestion/DashboardConsejero', $data);
        }

        $materiasFiltradas = collect();
        $docentesFiltrados = collect();

        // 3. Cargar datos según la vista seleccionada
        if ($currentView === 'materias') {
            $query = $this->getMateriasFiltradasQuery($selectedInstitutoId, $selectedCarreraId, $user);
            $materiasFiltradas = $query->orderBy('cuatrimestre')->paginate(10);
            $this->agregarDocentesPorCargo($materiasFiltradas);
        } elseif ($currentView === 'docentes') {
            $docentesFiltrados = $this->getDocentesFiltrados($selectedInstitutoId, $selectedCarreraId);
        }
        #dd($docentesFiltrados);
        return Inertia::render('Gestion/Dashboard', [
            'user' => $user,
            'institutos' => $institutosDisponibles,
            'selectedInstitutoId' => (int) $selectedInstitutoId,
            'selectedCarreraId' => $selectedCarreraId ?: 'all',
            'currentView' => $currentView,
            'materias' => $materiasFiltradas,
            'docentes' => $docentesFiltrados,
        ]);
    }

    private function getDocentesFiltrados($selectedInstitutoId, $selectedCarreraId)
    {
        if (!$selectedInstitutoId) {
            return collect();
        }

        $query = Docente::query();

        if ($selectedCarreraId && $selectedCarreraId !== 'all') {
            $query->deInstitutoYCarrera($selectedInstitutoId, $selectedCarreraId);
        } else {
            $query->deInstituto($selectedInstitutoId);
        }

        $docentes = $query->with([
            'cargos.dedicacion',
            'comisiones.materia',
        ])
            ->orderBy('apellido')
            ->paginate(15)
            ->withQueryString();

        $docentes->through(function ($doc) {

            return [
                'id' => $doc->id,
                'nombre' => $doc->nombre . ' ' . $doc->apellido,
                'modalidad' => $doc->modalidad_desempeño,
                'horas' => $doc->carga_horaria,

                'cargos' => $doc->cargos->map(function ($cargo) {
                    return [
                        'nombre' => $cargo->nombre,
                        'dedicacion' => $cargo->dedicacion?->nombre,
                    ];
                })->values(),

                'materias' => $doc->comisiones->map(fn($c) => $c->materia->nombre)
                    ->unique()
                    ->values(),
            ];
        });

        return $docentes;
    }



    private function getInstitutosPorRol(User $user)
    {
        $rol = $user->cargo;

        if (in_array($rol, ['Administrador', 'Administrativo de Secretaria Academica'])) {

            return Instituto::with('carreras.planActual')->get(['id', 'nombre']);

        } elseif (in_array($rol, ['Administrativo de instituto', 'Director de instituto', 'Coordinador Academico', 'Consejero'])) {

            $user->instituto->load([
                'carreras' => function ($query) {
                    $query->with('planActual');
                }
            ]);
            return collect([$user->instituto]);

        } elseif ($rol === 'Coordinador de Carrera') {

            $user->instituto->load([
                'carreras' => function ($query) use ($user) {

                    $carreraIds = $user->carreras()->pluck('carrera_id');

                    $query->whereIn('id', $carreraIds)
                        ->with('planActual');
                }
            ]);



            return collect([$user->instituto]);

        } else {

            return collect();
        }

    }

    private function getMateriasDisponibles(User $user, $institutosDisponibles)
    {

        $materiasAsignadas = $user->materias;

        if ($materiasAsignadas->isNotEmpty()) {

            $materiasAsignadas->load('comisiones');

            return $materiasAsignadas;

        } else {

            $todasLasMaterias = collect();

            $institutosDisponibles->load([
                'carreras.planActual.materias.comisiones'
            ]);

            foreach ($institutosDisponibles as $instituto) {

                foreach ($instituto->carreras as $carrera) {
                    $todasLasMaterias = $todasLasMaterias->merge($carrera->planActual->materias);
                }
            }

            return $todasLasMaterias->unique('id');
        }
    }


    private function getMateriasFiltradasQuery($institutoId, $carreraId = 'all', User $user = null)
    {
        $anioActual = date('Y');
        $cargosDisponibles = [
            'Titular',
            'Asociado',
            'Adjunto',
            'Jefe de Trabajos Practicos',
            'Ayudante de Primera'
        ];

        return Materia::query()
            ->where('estado', true)

            // Filtrado por instituto y carrera
            ->whereHas('planes.carrera', function ($q) use ($institutoId, $carreraId, $user) {
                $q->where('instituto_id', $institutoId);

                if ($carreraId !== 'all' && is_numeric($carreraId)) {
                    $q->where('id', $carreraId);
                } elseif ($user && $user->cargo === 'Coordinador de Carrera') {
                    $coordinadorCarreras = $user->carreras()->pluck('carrera_id');
                    $q->whereIn('id', $coordinadorCarreras);
                }
            })

            // Relaciones optimizadas
            ->with([
                'comisiones' => function ($q) use ($anioActual, $cargosDisponibles) {
                    $q->where('anio', $anioActual)
                        ->with([
                            'dictas' => function ($d) use ($cargosDisponibles) {
                                $d->with('cargo', 'docente')
                                    ->whereHas('cargo', function ($c) use ($cargosDisponibles) {
                                        $c->whereIn('nombre', $cargosDisponibles);
                                    });
                            }
                        ]);
                }
            ]);
    }

    private function agregarDocentesPorCargo($paginator)
    {
        $mapaCargos = [
            'Titular' => 'Titular',
            'Asociado' => 'Asociado',
            'Adjunto' => 'Adjunto',
            'Jefe de Trabajos Practicos' => 'JTP',
            'Ayudante de Primera' => 'Asist'
        ];

        foreach ($paginator->items() as $materia) {

            // inicializamos campos: Titular, Asociado, JTP, Asist...
            $docentesPorCargo = array_fill_keys(array_values($mapaCargos), []);

            foreach ($materia->comisiones as $comision) {
                foreach ($comision->dictas as $dicta) {

                    $cargoNombre = $dicta->cargo->nombre;

                    if (!array_key_exists($cargoNombre, $mapaCargos)) {
                        continue;
                    }

                    $clave = $mapaCargos[$cargoNombre];

                    $docentesPorCargo[$clave][] =
                        "{$dicta->docente->apellido}, {$dicta->docente->nombre}";
                }
            }

            // Escribimos los campos de salida
            foreach ($docentesPorCargo as $clave => $nombres) {
                $materia->{$clave} = implode('; ', $nombres);
            }
        }
    }

    /**
     * Render Consejero dashboard with KPIs
     */


    /**
     * Resumen ejecutivo del instituto (KPI Consejero)
     */
}
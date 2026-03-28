<?php

namespace App\Http\Controllers;

use App\Models\Materia;
use App\Models\Instituto;
use App\Models\Carrera;
use App\Models\User;
use App\Models\Docente;
use App\Models\Dicta;
use App\Models\Comision;
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
        
        // Dashboard para Administrativo de instituto
        if ($user->cargo === 'Administrativo de instituto') {
            return $this->administrativoHome($request);
        }
        
        // Dashboard original para otros roles
        return $this->originalHome($request);
    }

    /**
     * Dashboard específico para Administrativos de Instituto
     */
    private function administrativoHome(Request $request)
    {
        $user = Auth::user();
        $institutoId = $user->instituto_id;
        
        // Calcular año y cuatrimestre actual
        $currentYear = date('Y');
        $currentMonth = (int)date('m');
        $currentSemester = ($currentMonth >= 1 && $currentMonth <= 7) ? 1 : 2;
        
        // Obtener todos los datos necesarios
        $datosIncompletos = $this->getDocentesConDatosIncompletos($institutoId);
        $comisionesActuales = $this->getComisionesCuatrimestreActual($institutoId, $currentYear, $currentSemester);
        $docentesActivos = $this->getDocentesActivos($institutoId);
        $tareasPendientes = $this->getTareasPendientes($institutoId, $currentYear, $currentSemester);
        $cambiosRecientes = $this->getCambiosRecientes($institutoId);
        $kpis = $this->calculateKPIs($institutoId, $currentYear, $currentSemester);
        
        return Inertia::render('Gestion/DashboardAdministrativo', [
            'user' => $user,
            'instituto' => $user->instituto,
            'datosIncompletos' => $datosIncompletos,
            'comisionesActuales' => $comisionesActuales,
            'docentesActivos' => $docentesActivos,
            'tareasPendientes' => $tareasPendientes,
            'cambiosRecientes' => $cambiosRecientes,
            'kpis' => $kpis,
            'currentYear' => $currentYear,
            'currentSemester' => $currentSemester,
            'materiasCompartidas' => $this->getMateriasCompartidas($institutoId),
            'docentesMultiCarrera' => $this->getDocentesMultiCarrera($institutoId),
            'conflictosHorarios'   => $this->getConflictosHorarios($institutoId, $currentYear, $currentSemester),
            'totalCarreras'        => Carrera::where('instituto_id', $institutoId)->count(),
            'visionGeneral'        => $this->getVisionGeneral($institutoId),
        ]);
    }

    /**
     * Obtener docentes con datos incompletos
     */
    private function getDocentesConDatosIncompletos($institutoId)
    {
        $docentes = Docente::query()
            ->deInstituto($institutoId)
            ->where(function($q) {
                $q->whereNull('email')
                  ->orWhereNull('telefono')
                  ->orWhere('email', '')
                  ->orWhere('telefono', '');
            })
            ->select('id', 'nombre', 'apellido', 'email', 'telefono', 'legajo')
            ->orderBy('apellido')
            ->limit(20)
            ->get()
            ->map(function($docente) {
                $camposFaltantes = [];
                if (empty($docente->email)) $camposFaltantes[] = 'Email';
                if (empty($docente->telefono)) $camposFaltantes[] = 'Teléfono';
                
                return [
                    'id' => $docente->id,
                    'nombre_completo' => $docente->apellido . ', ' . $docente->nombre,
                    'legajo' => $docente->legajo,
                    'email' => $docente->email,
                    'telefono' => $docente->telefono,
                    'campos_faltantes' => $camposFaltantes,
                ];
            });

        return [
            'total' => $docentes->count(),
            'docentes' => $docentes,
        ];
    }

    /**
     * Obtener comisiones del cuatrimestre actual
     */
    private function getComisionesCuatrimestreActual($institutoId, $year, $semester)
    {
        $comisiones = Comision::query()
            ->where('anio', $year)
            ->where('cuatrimestre', $semester)
            ->whereHas('materia.planes.carrera', function($q) use ($institutoId) {
                $q->where('instituto_id', $institutoId);
            })
            ->with([
                'materia:id,nombre,codigo',
                'dictas' => function($q) {
                    $q->with(['docente:id,nombre,apellido', 'cargo:id,nombre']);
                }
            ])
            ->orderBy('id_materia')
            ->limit(30)
            ->get()
            ->map(function($comision) {
                $docentes = $comision->dictas->map(function($dicta) {
                    return [
                        'nombre' => $dicta->docente->apellido . ', ' . $dicta->docente->nombre,
                        'cargo' => $dicta->cargo->nombre ?? 'Sin cargo',
                    ];
                });

                return [
                    'id' => $comision->id,
                    'codigo' => $comision->codigo,
                    'nombre' => $comision->nombre,
                    'materia' => $comision->materia->nombre,
                    'turno' => $comision->turno,
                    'modalidad' => $comision->modalidad,
                    'docentes' => $docentes,
                    'total_docentes' => $docentes->count(),
                ];
            });

        return [
            'total' => $comisiones->count(),
            'comisiones' => $comisiones,
        ];
    }

    /**
     * Obtener docentes activos del instituto
     */
    private function getDocentesActivos($institutoId)
    {
        $docentes = Docente::query()
            ->where('es_activo', true)
            ->deInstituto($institutoId)
            ->with([
                'cargos.dedicacion',
                'comisiones' => function($q) {
                    $q->where('anio', date('Y'))
                      ->with('materia:id,nombre');
                }
            ])
            ->orderBy('apellido')
            ->limit(20)
            ->get()
            ->map(function($docente) {
                $materias = $docente->comisiones
                    ->pluck('materia.nombre')
                    ->unique()
                    ->values();

                return [
                    'id' => $docente->id,
                    'nombre_completo' => $docente->apellido . ', ' . $docente->nombre,
                    'email' => $docente->email,
                    'telefono' => $docente->telefono,
                    'carga_horaria' => $docente->carga_horaria,
                    'modalidad' => $docente->modalidad_desempeño,
                    'materias' => $materias,
                    'total_materias' => $materias->count(),
                ];
            });

        return [
            'total' => $docentes->count(),
            'docentes' => $docentes,
        ];
    }

    /**
     * Obtener tareas pendientes
     */
    private function getTareasPendientes($institutoId, $year, $semester)
    {
        // Materias del plan activo sin comisiones para el período actual
        $materiasSinComision = Materia::query()
            ->where('estado', true)
            ->where('cuatrimestre', $semester)
            ->whereHas('planes', function($q) use ($institutoId) {
                $q->whereNull('anio_fin')
                  ->whereHas('carrera', function($c) use ($institutoId) {
                      $c->where('instituto_id', $institutoId);
                  });
            })
            ->whereDoesntHave('comisiones', function($q) use ($year, $semester) {
                $q->where('anio', $year)
                  ->where('cuatrimestre', $semester);
            })
            ->select('id', 'nombre', 'codigo', 'cuatrimestre')
            ->orderBy('nombre')
            ->limit(15)
            ->get()
            ->map(function($materia) {
                return [
                    'id' => $materia->id,
                    'nombre' => $materia->nombre,
                    'codigo' => $materia->codigo,
                    'tipo' => 'Sin comisión creada',
                ];
            });

        // Comisiones sin docentes asignados
        $comisionesSinDocentes = Comision::query()
            ->where('anio', $year)
            ->where('cuatrimestre', $semester)
            ->whereHas('materia.planes.carrera', function($q) use ($institutoId) {
                $q->where('instituto_id', $institutoId);
            })
            ->whereDoesntHave('dictas')
            ->with('materia:id,nombre,codigo')
            ->orderBy('id_materia')
            ->limit(15)
            ->get()
            ->map(function($comision) {
                return [
                    'id' => $comision->id,
                    'nombre' => $comision->materia->nombre . ' - ' . $comision->nombre,
                    'codigo' => $comision->codigo,
                    'tipo' => 'Sin docentes asignados',
                ];
            });

        $tareas = $materiasSinComision->concat($comisionesSinDocentes);

        return [
            'total' => $tareas->count(),
            'tareas' => $tareas,
        ];
    }

    /**
     * Obtener cambios recientes
     */
    private function getCambiosRecientes($institutoId)
    {
        $cambios = Dicta::query()
            ->whereHas('comision.materia.planes.carrera', function($q) use ($institutoId) {
                $q->where('instituto_id', $institutoId);
            })
            ->with([
                'docente:id,nombre,apellido',
                'comision.materia:id,nombre',
                'cargo:id,nombre'
            ])
            ->orderBy('updated_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function($dicta) {
                return [
                    'id' => $dicta->id,
                    'docente' => $dicta->docente->apellido . ', ' . $dicta->docente->nombre,
                    'materia' => $dicta->comision->materia->nombre,
                    'comision' => $dicta->comision->nombre,
                    'cargo' => $dicta->cargo->nombre ?? 'Sin cargo',
                    'fecha' => $dicta->updated_at->format('d/m/Y H:i'),
                    'fecha_relativa' => $dicta->updated_at->diffForHumans(),
                ];
            });

        return [
            'total' => $cambios->count(),
            'cambios' => $cambios,
        ];
    }

    /**
     * Calcular KPIs
     */
    private function calculateKPIs($institutoId, $year, $semester)
    {
        // Total de docentes del instituto
        $totalDocentes = Docente::deInstituto($institutoId)->count();
        
        // Docentes con datos incompletos
        $docentesIncompletos = Docente::deInstituto($institutoId)
            ->where(function($q) {
                $q->whereNull('email')
                  ->orWhereNull('telefono')
                  ->orWhere('email', '')
                  ->orWhere('telefono', '');
            })
            ->count();
        
        $porcentajeIncompletos = $totalDocentes > 0 
            ? round(($docentesIncompletos / $totalDocentes) * 100, 1) 
            : 0;

        // Comisiones del período actual
        $comisionesCreadas = Comision::where('anio', $year)
            ->where('cuatrimestre', $semester)
            ->whereHas('materia.planes.carrera', function($q) use ($institutoId) {
                $q->where('instituto_id', $institutoId);
            })
            ->count();

        // Materias que deberían tener comisión
        $materiasDelPeriodo = Materia::where('estado', true)
            ->where('cuatrimestre', $semester)
            ->whereHas('planes', function($q) use ($institutoId) {
                $q->whereNull('anio_fin')
                  ->whereHas('carrera', function($c) use ($institutoId) {
                      $c->where('instituto_id', $institutoId);
                  });
            })
            ->count();

        $comisionesPendientes = max(0, $materiasDelPeriodo - $comisionesCreadas);

        // Docentes activos
        $docentesActivos = Docente::where('es_activo', true)
            ->deInstituto($institutoId)
            ->count();

        return [
            'registros_incompletos' => [
                'valor' => $docentesIncompletos,
                'total' => $totalDocentes,
                'porcentaje' => $porcentajeIncompletos,
            ],
            'comisiones' => [
                'creadas' => $comisionesCreadas,
                'pendientes' => $comisionesPendientes,
                'total_materias' => $materiasDelPeriodo,
            ],
            'docentes_activos' => [
                'valor' => $docentesActivos,
                'total' => $totalDocentes,
            ],
        ];
    }

    /**
     * Dashboard original para otros roles
     */
    private function originalHome(Request $request)
    {
        $user = Auth::user();
        $selectedInstitutoId = $request->input('instituto_id');
        $selectedCarreraId = $request->input('carrera_id');
        $currentView = $request->input('view', 'materias');

        // 1. Obtener Institutos disponibles
        $institutosDisponibles = $this->getInstitutosPorRol($user);

        // 2. Determinar el Instituto Seleccionado
        if (!$selectedInstitutoId) {
            $selectedInstitutoId = $institutosDisponibles->first()?->id;
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
     * Materias compartidas entre 2 o más carreras del instituto
     */
    private function getMateriasCompartidas($institutoId)
    {
        $carreraIds = Carrera::where('instituto_id', $institutoId)->pluck('id');

        $materias = Materia::query()
            ->whereHas('planes', function($q) use ($carreraIds) {
                $q->whereIn('carrera_id', $carreraIds);
            })
            ->with(['planes' => function($q) use ($carreraIds) {
                $q->whereIn('carrera_id', $carreraIds)->with('carrera:id,nombre');
            }])
            ->select('id', 'nombre', 'codigo')
            ->get()
            ->filter(function($materia) {
                $carrerasUnicas = $materia->planes->pluck('carrera_id')->unique();
                return $carrerasUnicas->count() >= 2;
            })
            ->map(function($materia) {
                $carreras = $materia->planes
                    ->pluck('carrera.nombre')
                    ->unique()
                    ->filter()
                    ->values()
                    ->toArray();

                return [
                    'id'             => $materia->id,
                    'nombre'         => $materia->nombre,
                    'codigo'         => $materia->codigo,
                    'carreras'       => $carreras,
                    'total_carreras' => count($carreras),
                ];
            })
            ->values();

        $totalMaterias = Materia::whereHas('planes.carrera', function($q) use ($institutoId) {
            $q->where('instituto_id', $institutoId);
        })->count();

        $porcentaje = $totalMaterias > 0
            ? round(($materias->count() / $totalMaterias) * 100, 1)
            : 0;

        return [
            'total'      => $materias->count(),
            'porcentaje' => $porcentaje,
            'materias'   => $materias,
        ];
    }

    /**
     * Docentes que dictan en 2 o más carreras del instituto
     */
    private function getDocentesMultiCarrera($institutoId)
    {
        $carreraIds = Carrera::where('instituto_id', $institutoId)->pluck('id');

        $docentes = Docente::query()
            ->deInstituto($institutoId)
            ->whereHas('comisiones.materia.planes', function($q) use ($carreraIds) {
                $q->whereIn('carrera_id', $carreraIds);
            })
            ->with(['comisiones.materia.planes' => function($q) use ($carreraIds) {
                $q->whereIn('carrera_id', $carreraIds)->with('carrera:id,nombre');
            }])
            ->select('id', 'nombre', 'apellido', 'legajo', 'email')
            ->get()
            ->filter(function($docente) {
                $carrerasUnicas = $docente->comisiones
                    ->flatMap(fn($c) => $c->materia->planes->pluck('carrera_id'))
                    ->unique();
                return $carrerasUnicas->count() >= 2;
            })
            ->map(function($docente) {
                $carreras = $docente->comisiones
                    ->flatMap(fn($c) => $c->materia->planes->pluck('carrera.nombre'))
                    ->unique()
                    ->filter()
                    ->values()
                    ->toArray();

                $iniciales = strtoupper(
                    substr($docente->apellido, 0, 1) . substr($docente->nombre, 0, 1)
                );

                return [
                    'id'              => $docente->id,
                    'nombre_completo' => $docente->apellido . ', ' . $docente->nombre,
                    'iniciales'       => $iniciales,
                    'legajo'          => $docente->legajo,
                    'email'           => $docente->email,
                    'carreras'        => $carreras,
                    'total_carreras'  => count($carreras),
                ];
            })
            ->values();

        return [
            'total'    => $docentes->count(),
            'docentes' => $docentes,
        ];
    }

    /**
     * Conflictos: docentes asignados a más de una comisión en el mismo período
     */
    private function getConflictosHorarios($institutoId, $year, $semester)
    {
        $conflictos = Dicta::query()
            ->whereHas('comision', function($q) use ($year, $semester, $institutoId) {
                $q->where('anio', $year)
                  ->where('cuatrimestre', $semester)
                  ->whereHas('materia.planes.carrera', function($c) use ($institutoId) {
                      $c->where('instituto_id', $institutoId);
                  });
            })
            ->with([
                'docente:id,nombre,apellido',
                'comision:id,nombre,turno,id_materia',
                'comision.materia:id,nombre',
            ])
            ->get()
            ->groupBy('docente_id')
            ->filter(fn($dictas) => $dictas->count() >= 2)
            ->map(function($dictas) {
                $docente = $dictas->first()->docente;
                return [
                    'docente'    => $docente->apellido . ', ' . $docente->nombre,
                    'comisiones' => $dictas->map(fn($d) => [
                        'nombre'  => $d->comision->nombre,
                        'materia' => $d->comision->materia->nombre,
                        'turno'   => $d->comision->turno,
                    ])->values(),
                ];
            })
            ->values();

        return [
            'total'      => $conflictos->count(),
            'conflictos' => $conflictos,
        ];
    }

    /**
     * Datos para la visión general (top materias compartidas)
     */
    private function getVisionGeneral($institutoId)
    {
        $materiasCompartidas = $this->getMateriasCompartidas($institutoId);

        $topMaterias = collect($materiasCompartidas['materias'])
            ->sortByDesc('total_carreras')
            ->take(5)
            ->values();

        return [
            'topMaterias' => $topMaterias,
        ];
    }
}
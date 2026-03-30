<?php

namespace App\Http\Controllers;

use App\Models\Carrera;
use App\Models\Comision;
use App\Models\Docente;
use App\Models\Instituto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardConsejeroController extends Controller
{
    /**
     * Display the Consejero de Instituto dashboard.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Verificar que el usuario es Consejero
        if ($user->cargo !== 'Consejero') {
            abort(403, 'Acceso no autorizado');
        }

        // Obtener el instituto del consejero
        $institutoId = $user->instituto_id;

        if (!$institutoId) {
            abort(403, 'Usuario sin instituto asignado');
        }

        $instituto = Instituto::findOrFail($institutoId);

        // Obtener todos los KPIs
        $resumenEjecutivo = $this->getResumenEjecutivo($institutoId);
        $distribucionDedicaciones = $this->getDistribucionDedicaciones($institutoId);
        $docentesSobrecargados = $this->getDocentesSobrecargados($institutoId);
        $materiasSinCobertura = $this->getMateriasSinCobertura($institutoId);
        $estadisticasCarreras = $this->getEstadisticasCarreras($institutoId);
        $evolucionHistorica = $this->getEvolucionHistorica($institutoId);

        return Inertia::render('Gestion/DashboardConsejero', [
            'user' => $user,
            'instituto' => $instituto,
            'resumenEjecutivo' => $resumenEjecutivo,
            'distribucionDedicaciones' => $distribucionDedicaciones,
            'docentesSobrecargados' => $docentesSobrecargados,
            'materiasSinCobertura' => $materiasSinCobertura,
            'estadisticasCarreras' => $estadisticasCarreras,
            'evolucionHistorica' => $evolucionHistorica,
        ]);
    }

    /**
     * Resumen ejecutivo del instituto
     */
    private function getResumenEjecutivo($institutoId)
    {
        $anioActual = date('Y');

        // Total de carreras activas
        $totalCarreras = Carrera::where('instituto_id', $institutoId)
            ->where('estado', true)
            ->count();

        // Total de docentes activos que dictan en el instituto
        $totalDocentes = Docente::whereHas('dictas.comision.materia.planes.carrera', function ($q) use ($institutoId) {
            $q->where('instituto_id', $institutoId);
        })
            ->where('es_activo', true)
            ->distinct()
            ->count();

        // Total de comisiones del año actual
        $totalComisiones = Comision::whereHas('materia.planes.carrera', function ($q) use ($institutoId) {
            $q->where('instituto_id', $institutoId);
        })
            ->where('anio', $anioActual)
            ->count();

        // Comisiones con cobertura (con docente responsable: Titular, Asociado, o Adjunto)
        $comisionesConCobertura = Comision::whereHas('materia.planes.carrera', function ($q) use ($institutoId) {
            $q->where('instituto_id', $institutoId);
        })
            ->where('anio', $anioActual)
            ->whereHas('dictas', function ($q) {
                $q->whereHas('cargo', function ($c) {
                    $c->whereIn('nombre', ['Titular', 'Asociado', 'Adjunto']);
                });
            })
            ->count();

        // Calcular porcentaje de cobertura
        $porcentajeCobertura = $totalComisiones > 0
            ? round(($comisionesConCobertura / $totalComisiones) * 100, 1)
            : 0;

        // Determinar estado general (semáforo)
        $estadoGeneral = 'green'; // Por defecto verde
        if ($porcentajeCobertura < 70) {
            $estadoGeneral = 'red';
        } elseif ($porcentajeCobertura < 90) {
            $estadoGeneral = 'yellow';
        }

        return [
            'totalCarreras' => $totalCarreras,
            'totalDocentes' => $totalDocentes,
            'totalComisiones' => $totalComisiones,
            'comisionesConCobertura' => $comisionesConCobertura,
            'porcentajeCobertura' => $porcentajeCobertura,
            'estadoGeneral' => $estadoGeneral,
        ];
    }

    /**
     * Distribución de dedicaciones
     */
    private function getDistribucionDedicaciones($institutoId)
    {
        $distribucion = DB::table('docentes')
            ->join('cargos', 'docentes.id', '=', 'cargos.docente_id')
            ->join('dedicaciones', 'cargos.dedicacion_id', '=', 'dedicaciones.id')
            ->join('dictas', 'cargos.id', '=', 'dictas.cargo_id')
            ->join('comisiones', 'dictas.comision_id', '=', 'comisiones.id')
            ->join('materias', 'comisiones.id_materia', '=', 'materias.id')
            ->join('plan_materia', 'materias.id', '=', 'plan_materia.materia_id')
            ->join('planes', 'plan_materia.plan_id', '=', 'planes.id')
            ->join('carreras', 'planes.carrera_id', '=', 'carreras.id')
            ->where('carreras.instituto_id', $institutoId)
            ->where('docentes.es_activo', true)
            ->select('dedicaciones.nombre', DB::raw('COUNT(DISTINCT docentes.id) as cantidad'))
            ->groupBy('dedicaciones.nombre')
            ->get();

        $total = $distribucion->sum('cantidad');

        return $distribucion->map(function ($item) use ($total) {
            return [
                'nombre' => $item->nombre,
                'cantidad' => $item->cantidad,
                'porcentaje' => $total > 0 ? round(($item->cantidad / $total) * 100, 1) : 0,
            ];
        })->toArray();
    }

    /**
     * Docentes con sobrecarga (exceden horas máximas de su dedicación)
     */
    private function getDocentesSobrecargados($institutoId)
    {
        $docentes = Docente::whereHas('dictas.comision.materia.planes.carrera', function ($q) use ($institutoId) {
            $q->where('instituto_id', $institutoId);
        })
            ->where('es_activo', true)
            ->with(['cargos.dedicacion'])
            ->get();

        $sobrecargados = [];

        foreach ($docentes as $docente) {
            foreach ($docente->cargos as $cargo) {
                if (!$cargo->dedicacion) {
                    continue;
                }

                $horasAsignadas = $cargo->sum_horas_frente_aula;
                $horasMaximas = $cargo->dedicacion->horas_frente_aula_max;

                if ($horasAsignadas > $horasMaximas) {
                    $sobrecargados[] = [
                        'id' => $docente->id,
                        'nombre' => $docente->nombre . ' ' . $docente->apellido,
                        'dedicacion' => $cargo->dedicacion->nombre,
                        'horasAsignadas' => $horasAsignadas,
                        'horasMaximas' => $horasMaximas,
                        'exceso' => $horasAsignadas - $horasMaximas,
                        'porcentajeExceso' => $horasMaximas > 0
                            ? round((($horasAsignadas - $horasMaximas) / $horasMaximas) * 100, 1)
                            : 0,
                    ];
                }
            }
        }

        return $sobrecargados;
    }

    /**
     * Materias sin cobertura (comisiones sin docente responsable)
     */
    private function getMateriasSinCobertura($institutoId)
    {
        $anioActual = date('Y');

        $comisionesSinCobertura = Comision::whereHas('materia.planes.carrera', function ($q) use ($institutoId) {
            $q->where('instituto_id', $institutoId);
        })
            ->where('anio', $anioActual)
            ->whereDoesntHave('dictas', function ($q) {
                $q->whereHas('cargo', function ($c) {
                    $c->whereIn('nombre', ['Titular', 'Asociado', 'Adjunto']);
                });
            })
            ->with('materia')
            ->get();

        return $comisionesSinCobertura->map(function ($comision) {
            return [
                'comisionId' => $comision->id,
                'comisionCodigo' => $comision->codigo,
                'comisionNombre' => $comision->nombre,
                'materiaNombre' => $comision->materia->nombre,
                'turno' => $comision->turno,
                'sede' => $comision->sede,
            ];
        })->toArray();
    }

    /**
     * Estadísticas por carrera
     */
    private function getEstadisticasCarreras($institutoId)
    {
        $anioActual = date('Y');
        $carreras = Carrera::where('instituto_id', $institutoId)
            ->where('estado', true)
            ->with(['planActual.materias'])
            ->get();

        $estadisticas = [];

        foreach ($carreras as $carrera) {
            if (!$carrera->planActual) {
                continue;
            }

            $materiasIds = $carrera->planActual->materias->pluck('id');
            $totalMaterias = $materiasIds->count();

            // Comisiones activas de la carrera
            $comisiones = Comision::whereIn('id_materia', $materiasIds)
                ->where('anio', $anioActual)
                ->get();

            $totalComisiones = $comisiones->count();

            // Comisiones con cobertura
            $comisionesConCobertura = Comision::whereIn('id_materia', $materiasIds)
                ->where('anio', $anioActual)
                ->whereHas('dictas', function ($q) {
                    $q->whereHas('cargo', function ($c) {
                        $c->whereIn('nombre', ['Titular', 'Asociado', 'Adjunto']);
                    });
                })
                ->count();

            // Docentes únicos asignados a la carrera
            $totalDocentes = Docente::whereHas('dictas.comision', function ($q) use ($materiasIds, $anioActual) {
                $q->whereIn('id_materia', $materiasIds)
                    ->where('anio', $anioActual);
            })
                ->where('es_activo', true)
                ->distinct()
                ->count();

            $porcentajeCobertura = $totalComisiones > 0
                ? round(($comisionesConCobertura / $totalComisiones) * 100, 1)
                : 0;

            $estadisticas[] = [
                'carreraId' => $carrera->id,
                'carreraNombre' => $carrera->nombre,
                'totalMaterias' => $totalMaterias,
                'totalComisiones' => $totalComisiones,
                'comisionesConCobertura' => $comisionesConCobertura,
                'porcentajeCobertura' => $porcentajeCobertura,
                'totalDocentes' => $totalDocentes,
            ];
        }

        return $estadisticas;
    }

    /**
     * Evolución histórica (tendencias)
     */
    private function getEvolucionHistorica($institutoId)
    {
        // Evolución de docentes por año (basado en created_at)
        $evolucionDocentes = DB::table('docentes')
            ->join('dictas', 'docentes.id', '=', 'dictas.docente_id')
            ->join('comisiones', 'dictas.comision_id', '=', 'comisiones.id')
            ->join('materias', 'comisiones.id_materia', '=', 'materias.id')
            ->join('plan_materia', 'materias.id', '=', 'plan_materia.materia_id')
            ->join('planes', 'plan_materia.plan_id', '=', 'planes.id')
            ->join('carreras', 'planes.carrera_id', '=', 'carreras.id')
            ->where('carreras.instituto_id', $institutoId)
            ->select(DB::raw('YEAR(docentes.created_at) as anio'), DB::raw('COUNT(DISTINCT docentes.id) as cantidad'))
            ->groupBy('anio')
            ->orderBy('anio')
            ->get();

        // Evolución de comisiones por año
        $evolucionComisiones = DB::table('comisiones')
            ->join('materias', 'comisiones.id_materia', '=', 'materias.id')
            ->join('plan_materia', 'materias.id', '=', 'plan_materia.materia_id')
            ->join('planes', 'plan_materia.plan_id', '=', 'planes.id')
            ->join('carreras', 'planes.carrera_id', '=', 'carreras.id')
            ->where('carreras.instituto_id', $institutoId)
            ->select('comisiones.anio', DB::raw('COUNT(*) as cantidad'))
            ->groupBy('comisiones.anio')
            ->orderBy('comisiones.anio')
            ->get();

        // Evolución de carreras por año
        $evolucionCarreras = DB::table('carreras')
            ->where('instituto_id', $institutoId)
            ->select(DB::raw('YEAR(created_at) as anio'), DB::raw('COUNT(*) as cantidad'))
            ->groupBy('anio')
            ->orderBy('anio')
            ->get();

        return [
            'docentes' => $evolucionDocentes->toArray(),
            'comisiones' => $evolucionComisiones->toArray(),
            'carreras' => $evolucionCarreras->toArray(),
        ];
    }
}

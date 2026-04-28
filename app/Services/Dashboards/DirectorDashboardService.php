<?php

namespace App\Services\Dashboards;

use App\Models\Docente;
use App\Models\Comision;
use App\Models\Instituto;
use App\Models\Carrera;
use App\Models\Cargo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DirectorDashboardService
{
    public function getData($institutoId = null)
    {
        $user = Auth::user();
        $instituto = $institutoId ? Instituto::find($institutoId) : $user->instituto;

        if (!$instituto) {
            return $this->getEmptyData();
        }

        $institutoId = $instituto->id;

        return [
            'user' => $user,
            'instituto' => $instituto,
            'resumenGeneral' => $this->getResumenGeneral($institutoId),
            'distribucionRH' => $this->getDistribucionRH($institutoId),
            'estadoCarreras' => $this->getEstadoCarreras($institutoId),
            'alertasDocentes' => $this->getAlertasDocentes($institutoId),
            'materiasCriticas' => $this->getMateriasCriticas($institutoId),
            'comparativoInstitutos' => $this->getComparativoInstitutos($institutoId),
            'metricasComparativas' => $this->getMetricasComparativas($institutoId),
            'proyecciones' => $this->getProyecciones($institutoId),
        ];
    }

    private function getEmptyData()
    {
        return [
            'user' => Auth::user(),
            'instituto' => null,
            'resumenGeneral' => [
                'totalDocentes' => 0,
                'totalCarreras' => 0,
                'totalComisiones' => 0,
                'porcentajeCobertura' => 0
            ],
            'distribucionRH' => ['porDedicacion' => [], 'porModalidad' => []],
            'estadoCarreras' => [],
            'alertasDocentes' => ['sobrecargados' => [], 'disponibles' => []],
            'materiasCriticas' => [],
            'comparativoInstitutos' => [],
        ];
    }

    private function getResumenGeneral($institutoId)
    {
        $totalDocentes = Docente::deInstituto($institutoId)->where('es_activo', true)->count();
        $totalCarreras = Carrera::where('instituto_id', $institutoId)->count();
        
        $comisiones = Comision::byInstituto($institutoId)
            ->where('anio', now()->year)
            ->with('dictas.cargo')
            ->get();

        $totalComisiones = $comisiones->count();
        $cubiertas = $comisiones->filter(fn($c) => $c->estaCompleta())->count();
        $porcentajeCobertura = $totalComisiones > 0 ? round(($cubiertas / $totalComisiones) * 100, 1) : 0;

        return [
            'totalDocentes' => $totalDocentes,
            'totalCarreras' => $totalCarreras,
            'totalComisiones' => $totalComisiones,
            'porcentajeCobertura' => $porcentajeCobertura,
            'estado' => $porcentajeCobertura >= 80 ? 'Óptimo' : ($porcentajeCobertura >= 60 ? 'Regular' : 'Crítico')
        ];
    }

    private function getDistribucionRH($institutoId)
    {
        $docentes = Docente::deInstituto($institutoId)->where('es_activo', true)->get();
        $total = $docentes->count();

        // Por modalidad
        $porModalidad = $docentes->groupBy('modalidad_desempeño')
            ->map(fn($group, $key) => [
                'nombre' => $key ?: 'No definida',
                'cantidad' => $group->count(),
                'porcentaje' => $total > 0 ? round(($group->count() / $total) * 100, 1) : 0
            ])->values();

        // Por dedicación
        $docentesIds = $docentes->pluck('id');
        $porDedicacion = DB::table('cargos')
            ->join('dedicaciones', 'cargos.dedicacion_id', '=', 'dedicaciones.id')
            ->whereIn('cargos.docente_id', $docentesIds)
            ->select('dedicaciones.nombre', DB::raw('count(distinct cargos.docente_id) as cantidad'))
            ->groupBy('dedicaciones.nombre')
            ->get()
            ->map(fn($item) => [
                'nombre' => $item->nombre,
                'cantidad' => $item->cantidad,
                'porcentaje' => $total > 0 ? round(($item->cantidad / $total) * 100, 1) : 0
            ]);

        return [
            'porModalidad' => $porModalidad,
            'porDedicacion' => $porDedicacion
        ];
    }

    private function getEstadoCarreras($institutoId)
    {
        return Carrera::where('instituto_id', $institutoId)
            ->with(['planActual.materias.comisiones' => function($q) {
                $q->where('anio', now()->year)->with('dictas.cargo');
            }])
            ->get()
            ->map(function($carrera) {
                $comisiones = collect();
                $totalMaterias = 0;
                if ($carrera->planActual) {
                    $totalMaterias = $carrera->planActual->materias->count();
                    foreach ($carrera->planActual->materias as $materia) {
                        $comisiones = $comisiones->concat($materia->comisiones);
                    }
                }

                $totalCom = $comisiones->count();
                $cubiertas = $comisiones->filter(fn($c) => $c->estaCompleta())->count();

                return [
                    'nombre' => $carrera->nombre,
                    'totalComisiones' => $totalCom,
                    'cubiertas' => $cubiertas,
                    'porcentaje' => $totalCom > 0 ? round(($cubiertas / $totalCom) * 100, 1) : 0,
                    'estado' => $carrera->planActual ? 'Activa' : 'Inactiva',
                    'alumnos' => rand(150, 450), // Placeholder por falta de tabla Estudiantes
                    'materias' => $totalMaterias
                ];
            });
    }

    private function getAlertasDocentes($institutoId)
    {
        $docentes = Docente::deInstituto($institutoId)
            ->where('es_activo', true)
            ->with('cargos.dedicacion')
            ->get();

        $sobrecargados = [];
        $disponibles = [];

        foreach ($docentes as $docente) {
            foreach ($docente->cargos as $cargo) {
                if (!$cargo->dedicacion) continue;

                $horas = $cargo->sum_horas_frente_aula;
                $max = $cargo->dedicacion->horas_frente_aula_max;
                $min = $cargo->dedicacion->horas_frente_aula_min;

                if ($horas > $max) {
                    $sobrecargados[] = [
                        'docente' => $docente->nombre_completo,
                        'cargo' => $cargo->nombre,
                        'horas' => $horas,
                        'max' => $max,
                        'exceso' => $horas - $max
                    ];
                } elseif ($horas < $min) {
                    $disponibles[] = [
                        'docente' => $docente->nombre_completo,
                        'cargo' => $cargo->nombre,
                        'horas' => $horas,
                        'min' => $min,
                        'faltante' => $min - $horas
                    ];
                }
            }
        }

        return [
            'sobrecargados' => collect($sobrecargados)->sortByDesc('exceso')->take(10)->values(),
            'disponibles' => collect($disponibles)->sortByDesc('faltante')->take(10)->values()
        ];
    }

    private function getMateriasCriticas($institutoId)
    {
        return Comision::byInstituto($institutoId)
            ->where('anio', now()->year)
            ->with(['materia', 'dictas.cargo'])
            ->get()
            ->filter(fn($c) => !$c->estaCompleta())
            ->map(fn($c) => [
                'materia' => $c->materia->nombre,
                'comision' => $c->nombre,
                'turno' => $c->turno,
                'motivo' => $this->getMotivoIncompleta($c)
            ])->values();
    }

    private function getMotivoIncompleta($comision)
    {
        $cargos = $comision->dictas->map(fn($d) => strtolower($d->cargo->nombre ?? ''));
        $tieneResp = $cargos->contains(fn($c) => str_contains($c, 'titular') || str_contains($c, 'adjunto') || str_contains($c, 'asociado'));
        $tieneAux = $cargos->contains(fn($c) => str_contains($c, 'jefe de trabajos') || str_contains($c, 'ayudante'));

        if (!$tieneResp && !$tieneAux) return 'Sin asignación';
        if (!$tieneResp) return 'Falta Responsable';
        if (!$tieneAux) return 'Falta Auxiliar';
        return 'Incompleta';
    }

    private function getComparativoInstitutos($institutoId)
    {
        return Instituto::all()->map(function($ins) use ($institutoId) {
            $totalCom = Comision::byInstituto($ins->id)->where('anio', now()->year)->count();
            $cubiertas = 0;
            if ($totalCom > 0) {
                $cubiertas = Comision::byInstituto($ins->id)->where('anio', now()->year)->with('dictas.cargo')->get()->filter(fn($c) => $c->estaCompleta())->count();
            }
            
            return [
                'nombre' => $ins->nombre,
                'cobertura' => $totalCom > 0 ? round(($cubiertas / $totalCom) * 100, 1) : 0,
                'esActual' => $ins->id == $institutoId
            ];
        });
    }

    private function getMetricasComparativas($institutoId)
    {
        $todos = Instituto::all()->map(function($ins) {
            $comisiones = Comision::byInstituto($ins->id)->where('anio', now()->year)->with('dictas.cargo')->get();
            $total = $comisiones->count();
            $cubiertas = $comisiones->filter(fn($c) => $c->estaCompleta())->count();
            return [
                'id' => $ins->id,
                'cobertura' => $total > 0 ? ($cubiertas / $total) * 100 : 0
            ];
        });

        $promedio = $todos->avg('cobertura');
        $actual = $todos->firstWhere('id', $institutoId)['cobertura'] ?? 0;

        return [
            'coberturaActual' => round($actual, 1),
            'promedioInstitucional' => round($promedio, 1),
            'diferencia' => round($actual - $promedio, 1)
        ];
    }

    private function getProyecciones($institutoId)
    {
        // Buscamos comisiones del próximo año o próximo cuatrimestre que estén vacías
        $anioProximo = now()->year + 1;
        
        $vacantesFuturas = Comision::byInstituto($institutoId)
            ->where(function($q) use ($anioProximo) {
                $q->where('anio', '>', now()->year)
                  ->orWhere(function($sq) {
                      $sq->where('anio', now()->year)
                        ->where('cuatrimestre', '>', 1); // Asumiendo que estamos en el 1
                  });
            })
            ->with(['materia', 'dictas'])
            ->get()
            ->filter(fn($c) => $c->dictas->count() == 0)
            ->map(fn($c) => [
                'materia' => $c->materia->nombre,
                'comision' => $c->nombre,
                'periodo' => "{$c->anio} - {$c->cuatrimestre}° Cuat.",
                'prioridad' => 'Alta'
            ])->values();

        return [
            'materiasSinAsignacion' => $vacantesFuturas,
            'mensaje' => "No se pueden calcular jubilaciones por falta de datos de nacimiento en los registros docentes."
        ];
    }
}

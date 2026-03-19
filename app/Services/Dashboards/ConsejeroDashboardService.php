<?php

namespace App\Services\Dashboards;

use App\Models\Docente;
use App\Models\Comision;
use App\Models\Materia;
use App\Models\Instituto;
use App\Models\Carrera;
use Illuminate\Support\Facades\Auth;

class ConsejeroDashboardService
{
    public function getData($institutoId = null)
    {
        $user = Auth::user();
        $instituto = $user->instituto;

        if (!$instituto) {
            return $this->getEmptyData();
        }

        $institutoId = $institutoId ?: $instituto->id;

        return [
            'user' => $user,
            'instituto' => $instituto,
            'resumenEjecutivo' => $this->getResumenEjecutivo($institutoId),
            'distribucionDedicaciones' => $this->getDistribucionDedicaciones($institutoId),
            'docentesSobrecargados' => $this->getDocentesSobrecargados($institutoId),
            'materiasSinCobertura' => $this->getMateriasSinCobertura($institutoId),
            'estadisticasCarreras' => $this->getEstadisticasCarreras($institutoId),
            'evolucionHistorica' => $this->getEvolucionHistorica($institutoId),
        ];
    }

    private function getEmptyData()
    {
        return [
            'user' => Auth::user(),
            'instituto' => null,
            'resumenEjecutivo' => [
                'totalCarreras' => 0,
                'totalDocentes' => 0,
                'totalComisiones' => 0,
                'comisionesConCobertura' => 0,
                'porcentajeCobertura' => 0,
                'estadoGeneral' => 'green',
            ],
            'distribucionDedicaciones' => [],
            'docentesSobrecargados' => [],
            'materiasSinCobertura' => [],
            'estadisticasCarreras' => [],
            'evolucionHistorica' => ['docentes' => [], 'comisiones' => [], 'carreras' => []],
        ];
    }

    private function getResumenEjecutivo($institutoId)
    {
        $totalCarreras = Carrera::where('instituto_id', $institutoId)->count();

        $totalDocentes = Docente::whereHas('dictas.comision.materia.planes.carrera', function ($q) use ($institutoId) {
            $q->where('instituto_id', $institutoId);
        })->where('es_activo', true)->distinct()->count();

        $totalComisiones = Comision::whereHas('materia.planes.carrera', function ($q) use ($institutoId) {
            $q->where('instituto_id', $institutoId);
        })->count();

        $comisionesConCobertura = Comision::whereHas('dictas')->whereHas('materia.planes.carrera', function ($q) use ($institutoId) {
            $q->where('instituto_id', $institutoId);
        })->count();

        $porcentajeCobertura = $totalComisiones > 0 ? round(($comisionesConCobertura / $totalComisiones) * 100, 2) : 0;

        return [
            'totalCarreras' => $totalCarreras,
            'totalDocentes' => $totalDocentes,
            'totalComisiones' => $totalComisiones,
            'comisionesConCobertura' => $comisionesConCobertura,
            'porcentajeCobertura' => $porcentajeCobertura,
            'estadoGeneral' => $porcentajeCobertura >= 90 ? 'green' : ($porcentajeCobertura >= 70 ? 'yellow' : 'red'),
        ];
    }

    private function getDistribucionDedicaciones($institutoId)
    {
        $docentes = Docente::whereHas('dictas.comision.materia.planes.carrera', function ($q) use ($institutoId) {
            $q->where('instituto_id', $institutoId);
        })->with('cargos.dedicacion')->get();

        $distribucion = collect();
        $totalDocentes = $docentes->count();

        foreach ($docentes as $docente) {
            $dedicacion = $docente->cargos->first()?->dedicacion?->nombre ?? 'Sin especificar';
            $distribucion->push($dedicacion);
        }

        $grouped = $distribucion->countBy();
        $result = [];

        foreach ($grouped as $nombre => $cantidad) {
            $result[] = [
                'nombre' => $nombre,
                'cantidad' => $cantidad,
                'porcentaje' => $totalDocentes > 0 ? round(($cantidad / $totalDocentes) * 100, 1) : 0,
            ];
        }

        return collect($result)->sortByDesc('cantidad')->values()->all();
    }

    private function getDocentesSobrecargados($institutoId)
    {
        $docentes = Docente::whereHas('dictas.comision.materia.planes.carrera', function ($q) use ($institutoId) {
            $q->where('instituto_id', $institutoId);
        })->with('cargos.dedicacion', 'dictas.comision')->get();

        $sobrecargados = [];

        foreach ($docentes as $docente) {
            $dedicacion = $docente->cargos->first();
            if (!$dedicacion) continue;

            $horasMaximas = $dedicacion->dedicacion?->horas_maximas ?? 40;
            $comisionesCount = $docente->dictas()->count();
            $horasAsignadas = $comisionesCount * 2; // Aproximación: 2 horas por comisión

            if ($horasAsignadas > $horasMaximas) {
                $sobrecargados[] = [
                    'id' => $docente->id,
                    'nombre' => $docente->nombre . ' ' . $docente->apellido,
                    'horasAsignadas' => $horasAsignadas,
                    'horasMaximas' => $horasMaximas,
                    'exceso' => $horasAsignadas - $horasMaximas,
                    'porcentajeExceso' => round((($horasAsignadas - $horasMaximas) / $horasMaximas) * 100, 1),
                    'dedicacion' => $dedicacion->dedicacion?->nombre ?? 'No especificada',
                ];
            }
        }

        return array_values($sobrecargados);
    }

    private function getMateriasSinCobertura($institutoId)
    {
        $materias = Materia::whereHas('planes.carrera', function ($q) use ($institutoId) {
            $q->where('instituto_id', $institutoId);
        })->with('planes.carrera', 'comisiones')->get();

        $sinCobertura = [];

        foreach ($materias as $materia) {
            if ($materia->comisiones()->count() === 0) {
                $comision = $materia->comisiones()->first();
                $sinCobertura[] = [
                    'id' => $materia->id,
                    'materiaNombre' => $materia->nombre,
                    'comisionNombre' => $comision?->numero ?? 'N/A',
                    'turno' => $comision?->turno ?? 'N/A',
                    'sede' => $comision?->sede ?? 'N/A',
                ];
            }
        }

        return array_values($sinCobertura);
    }

    private function getEstadisticasCarreras($institutoId)
    {
        $carreras = Carrera::where('instituto_id', $institutoId)->with('planes.materias.comisiones.dictas')->get();

        $estadisticas = [];

        foreach ($carreras as $carrera) {
            $totalMaterias = 0;
            $totalComisiones = 0;
            $comisionesConCobertura = 0;
            $docentes = collect();

            foreach ($carrera->planes as $plan) {
                $totalMaterias += $plan->materias()->count();
                foreach ($plan->materias as $materia) {
                    $comisionesMateria = $materia->comisiones()->count();
                    $totalComisiones += $comisionesMateria;
                    
                    // Contar comisiones con cobertura (que tengan dictas)
                    foreach ($materia->comisiones as $comision) {
                        if ($comision->dictas()->count() > 0) {
                            $comisionesConCobertura++;
                            foreach ($comision->dictas as $dicta) {
                                $docentes->push($dicta->docente_id);
                            }
                        }
                    }
                }
            }

            $totalDocentes = $docentes->unique()->count();
            $porcentajeCobertura = $totalComisiones > 0 ? round(($comisionesConCobertura / $totalComisiones) * 100, 1) : 0;

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

        return array_values($estadisticas);
    }

    private function getEvolucionHistorica($institutoId)
    {
        // Datos simulados de evolución histórica (puedes ajustar según tu BD)
        return [
            'docentes' => [
                ['anio' => 2023, 'cantidad' => 15],
                ['anio' => 2024, 'cantidad' => 18],
                ['anio' => 2025, 'cantidad' => 20],
            ],
            'comisiones' => [
                ['anio' => 2023, 'cantidad' => 42],
                ['anio' => 2024, 'cantidad' => 48],
                ['anio' => 2025, 'cantidad' => 52],
            ],
            'carreras' => [
                ['anio' => 2023, 'cantidad' => 4],
                ['anio' => 2024, 'cantidad' => 5],
                ['anio' => 2025, 'cantidad' => 5],
            ],
        ];
    }
}
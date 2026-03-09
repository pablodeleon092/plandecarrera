<?php
namespace App\Dashboards;

use App\Contracts\DashboardStrategy;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Materia;
use App\Models\Instituto;
use App\Models\Carrera;
use App\Models\Docente;
use App\Models\Dicta;
use App\Models\Comision;

class CoordinadorDashboard implements DashboardStrategy
{

    public function render(User $user, Request $request): Response
    {
        $carreras = $user->carreras()->select('carreras.id', 'carreras.nombre')->get();
        $selectedCarreraId = $request->input('selected_carrera');

        // Si no hay ID en el request, tomamos la primera
        if (!$selectedCarreraId && $carreras->isNotEmpty()) {
            $selectedCarreraId = $carreras->first()->id;
        }

        $mapaCurricular = null;
        if ($selectedCarreraId) {
            $mapaCurricular = $this->getResumenMapaCurricular($selectedCarreraId);
            $coberturaPorAño = $this->getCoberturaPorAño($selectedCarreraId);
            $equipoDocenteCarrera = $this->getEquipoDocenteCarrera($selectedCarreraId);
            $cargaHorariaDelPlanPorAño = $this->getCargaHorariaDelPlanPorAño($selectedCarreraId);
            $kpis = $this->getKpisCarrera($selectedCarreraId);
        }

        return Inertia::render('Gestion/DashboardCoordinador', [
            'user' => $user,
            'carreras' => $carreras,
            'selectedCarreraId' => $selectedCarreraId ? (int) $selectedCarreraId : null,
            'mapaCurricular' => $mapaCurricular,
            'coberturaPorAño' => $coberturaPorAño,
            'equipoDocenteCarrera' => $equipoDocenteCarrera, 
            'cargaHorariaPlan' => $cargaHorariaDelPlanPorAño,
            'kpis' => $kpis,
        ]);
    }

    private function getResumenMapaCurricular($carreraId)
    {
        $carrera = \App\Models\Carrera::with([
            'planActual.materias.comisiones.docentes'
        ])->findOrFail($carreraId);

        $plan = $carrera->planActual;
        if (!$plan) return null;

        return [
            'plan_nombre' => $plan->nombre,
            'materias' => $plan->materias->map(function ($materia) {
                // Transformamos las comisiones para que el frontend las lea fácil
                $comisionesData = $materia->comisiones->map(function($comision) {
                    return [
                        'nombre' => $comision->nombre,
                        // Traemos los nombres de los docentes de esta comisión
                        'docentes' => $comision->docentes->pluck('nombre_completo')->toArray() ?? []
                    ];
                });

                return [
                    'id' => $materia->id,
                    'nombre' => $materia->nombre,
                    'cuatrimestre' => $materia->cuatrimestre,
                    'comisiones' => $comisionesData,
                    'estado' => $this->determinarEstadoEvolucionado($materia)
                ];
            })
        ];
    }

    private function getCoberturaPorAño($carreraId)
    {
        // Cargamos la relación: Comisiones -> Dictas (donde está el cargo) -> Docente
        $carrera = Carrera::with([
            'planActual.materias.comisiones.dictas.docente',
            'planActual.materias.comisiones.dictas.cargo'
        ])->findOrFail($carreraId);

        $plan = $carrera->planActual;
        if (!$plan) return null;

        $materiasAgrupadas = $plan->materias->map(function ($materia) {
            $cuat = $materia->cuatrimestre;
            if ($materia->regimen = 'cuatrimestral') {
                $año = ceil($cuat / 2);
            } else {
                $año = $cuat;
            }

            $comisionesData = $materia->comisiones->map(function($comision) {
                return [
                    'nombre' => $comision->nombre,
                    'es_valida' => $comision->estaCompleta(),
                    // Aquí recorremos 'dictas' porque es el que une al docente con su cargo en esta comisión
                    'docentes' => $comision->dictas->map(function($dicta) {
                        return [
                            'nombre_completo' => "{$dicta->docente->nombre_completo}",
                            'cargo' => $dicta->cargo->nombre ?? 'Sin Cargo'
                        ];
                    })
                ];
            });
            return [
                'id' => $materia->id,
                'nombre' => $materia->nombre,
                'año' => $año,
                'cuatrimestre' => $cuat,
                'comisiones' => $comisionesData,
            ];
        })->groupBy('año');

        return [
            'plan_nombre' => $plan->nombre,
            'años' => $materiasAgrupadas
        ];
    }

    private function getEquipoDocenteCarrera($carreraId)
    {
        $carrera = Carrera::with([
            'planActual.materias.comisiones.dictas.docente.cargos'
        ])->findOrFail($carreraId);

        $plan = $carrera->planActual;
        
        if (!$plan) return ['docentes' => []];

        // Debug: Verifica si el plan tiene materias
        // dd($plan->materias->count()); 

        $docentes = collect();

        foreach ($plan->materias as $materia) {
            foreach ($materia->comisiones as $comision) {
                foreach ($comision->dictas as $dicta) {
                    if ($dicta->docente) {
                        $docentes->push($dicta->docente);
                    }
                }
            }
        }

        $docentesUnicos = $docentes->unique('id');

        return [
            'docentes' => $docentesUnicos->map(function ($docente) {
                return [
                    'id' => $docente->id,
                    'nombre' => $docente->nombre_completo,
                    'modalidad_desempeño' => $docente->modalidad_desempeño,
                    'cargos' => $docente->cargos->map(fn($c) => [
                        'nombre' => $c->nombre,
                        'nro_materias_asig' => $c->nro_materias_asig,
                        'sum_horas_frente_aula' => $c->sum_horas_frente_aula,
                    ]),
                ];
            })->values()
        ];
    }

    private function getCargaHorariaDelPlanPorAño($carreraId)
    {
        $carrera = Carrera::with([
            'planActual.materias.comisiones.dictas'
        ])->findOrFail($carreraId);

        $plan = $carrera->planActual;
        if (!$plan) return null;

        $materiasAgrupadas = $plan->materias->map(function ($materia) {
            $cuat = $materia->cuatrimestre;
            // Corrección de lógica de año
            $año = ($materia->regimen == 'cuatrimestral') ? ceil($cuat / 2) : $cuat;

            $comisionesData = $materia->comisiones->map(function($comision) {
                // Sumamos las horas que los docentes efectivamente tienen frente al aula
                $horasAsignadas = $comision->dictas->sum('horas_frente_aula');
                
                // Definimos si se cumple (puedes ajustar la lógica si deben ser exactas)
                $estaCubierta = $horasAsignadas >= $comision->horas_totales;

                return [
                    'nombre' => $comision->nombre,
                    'horas_teoricas' => $comision->horas_teoricas,
                    'horas_practicas' => $comision->horas_practicas,
                    'horas_totales_requeridas' => $comision->horas_totales,
                    'horas_asignadas_real' => $horasAsignadas,
                    'es_valida' => $estaCubierta,
                    'deficit' => $comision->horas_totales - $horasAsignadas
                ];
            });

            return [
                'id' => $materia->id,
                'nombre' => $materia->nombre,
                'año' => $año,
                'cuatrimestre' => $cuat,
                'comisiones' => $comisionesData,
                // La materia está OK solo si todas sus comisiones cubren las horas
                'horas_ok' => $comisionesData->every('es_valida')
            ];
        })->groupBy('año');

        return [
            'plan_nombre' => $plan->nombre,
            'años' => $materiasAgrupadas
        ];
    }


    private function determinarEstadoEvolucionado($materia)
    {
        if ($materia->comisiones->isEmpty()) return 'Pendiente';
        
        $conDocente = $materia->comisiones->filter(fn($c) => $c->docentes->isNotEmpty())->count();
        $total = $materia->comisiones->count();

        if ($conDocente === 0) return 'Sin Docente';
        if ($conDocente === $total) return 'Completo';
        return 'Cobertura Parcial';
    }

    private function getKpisCarrera($carreraId)
    {
        $carrera = Carrera::findOrFail($carreraId);

        $plan = $carrera->planActual;

        $materias = $plan->materias;
        // Obtenemos todas las comisiones del plan en una sola colección
        $todasLasComisiones = $materias->flatMap->comisiones;
        $totalComisiones = $todasLasComisiones->count();
        
        if ($totalComisiones === 0) return null;

        // 1. % de COMISIONES con equipo completo
        // Usamos el método estaCompleta() que ya movimos al modelo Comision
        $comisionesCompletas = $todasLasComisiones->filter(fn($c) => $c->estaCompleta())->count();
        $porcentajeCobertura = ($comisionesCompletas / $totalComisiones) * 100;

        // 2. Ratio Horas Teóricas/Prácticas (Mantenemos la lógica por comisión)
        $horasTeoricas = $todasLasComisiones->sum('horas_teoricas');
        $horasPracticas = $todasLasComisiones->sum('horas_practicas');
        
        $totalHoras = $horasTeoricas + $horasPracticas;
        $ratioTeoria = $totalHoras > 0 ? ($horasTeoricas / $totalHoras) * 100 : 0;
        $ratioPractica = $totalHoras > 0 ? ($horasPracticas / $totalHoras) * 100 : 0;

        // 3. Materias con "Docente Único" (Mantenemos a nivel Materia por riesgo de cátedra)
        $materiasRiesgo = $materias->filter(fn($m) => $m->tieneDocenteUnico())->count();

        return [
            'cobertura_equipo' => round($porcentajeCobertura, 1),
            'comisiones_completas' => $comisionesCompletas,
            'total_comisiones' => $totalComisiones,
            'ratio_teoria' => round($ratioTeoria, 1),
            'ratio_practica' => round($ratioPractica, 1),
            'materias_riesgo' => $materiasRiesgo,
        ];
    }
    
}
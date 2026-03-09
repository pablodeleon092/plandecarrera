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

        // Eliminamos el Inertia::lazy para que en la primera carga (con la carrera por defecto)
        // los datos viajen de inmediato al frontend.
        $mapaCurricular = null;
        if ($selectedCarreraId) {
            $mapaCurricular = $this->getResumenMapaCurricular($selectedCarreraId);
        }

        return Inertia::render('Gestion/DashboardCoordinador', [
            'user' => $user,
            'carreras' => $carreras,
            'selectedCarreraId' => $selectedCarreraId ? (int) $selectedCarreraId : null,
            'mapaCurricular' => $mapaCurricular, // Ya no es lazy, es data directa
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

    private function determinarEstadoEvolucionado($materia)
    {
        if ($materia->comisiones->isEmpty()) return 'Pendiente';
        
        $conDocente = $materia->comisiones->filter(fn($c) => $c->docentes->isNotEmpty())->count();
        $total = $materia->comisiones->count();

        if ($conDocente === 0) return 'Sin Docente';
        if ($conDocente === $total) return 'Completo';
        return 'Cobertura Parcial';
    }

}
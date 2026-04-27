<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Instituto;
use App\Models\Materia;
use App\Models\Plan;
use App\Models\Carrera;
use Inertia\Inertia;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

class PlanController extends Controller
{

    public function create(int $carrera)
    {
        // Obtenemos las materias que ya están en el plan
        $carrera = Carrera::findOrFail($carrera);
        $this->authorize('update', $carrera);
        $plan_anterior = $carrera->planActual;

        $materiasEnPlanActual = $plan_anterior->materias;

        // Obtenemos los IDs de las materias que ya están en el plan
        $materiasEnPlanIds = $materiasEnPlanActual->pluck('id');

        // Obtenemos las materias que NO están en el plan para mostrarlas como disponibles
        $materiasDisponibles = Materia::whereNotIn('id', $materiasEnPlanIds)->get();

        return Inertia::render('Planes/Create', [
            'carrera' => $carrera,
            'materiasEnPlanAnterior' => $materiasEnPlanActual,
            'materiasDisponibles' => $materiasDisponibles,
            'flash' => session()->only(['success', 'error']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'carrera_id'    => 'required|exists:carreras,id',
            'anio_comienzo' => 'required|date', // Valida formato YYYY-MM-DD
            'materias'      => 'required|array|min:1',
            'materias.*'    => 'exists:materias,id',
        ]);

        try {
            $plan = Plan::create([
                'carrera_id'    => $validated['carrera_id'],
                'anio_comienzo' => $validated['anio_comienzo'],
                // 'anio_fin' se mantiene null hasta que se cree un nuevo plan 
                // o se cierre este manualmente
            ]);

            $plan->materias()->attach($validated['materias']);

            return redirect()->route('carreras.show', $validated['carrera_id'])
                ->with('success', 'Nuevo plan de estudio creado correctamente.');

        } catch (\Exception $e) {
            return back()->with('error', 'Error al guardar el plan: ' . $e->getMessage())->withInput();
        }
    }

    public function edit(Plan $plan)
    {
        // Obtenemos las materias que ya están en el plan
        $carrera = $plan->carrera()->get();
        $this->authorize('update', $carrera);
        $materiasEnPlan = $plan->materias()->get();

        // Obtenemos los IDs de las materias que ya están en el plan
        $materiasEnPlanIds = $materiasEnPlan->pluck('id');

        // Obtenemos las materias que NO están en el plan para mostrarlas como disponibles
        $materiasDisponibles = Materia::whereNotIn('id', $materiasEnPlanIds)->get();

        return Inertia::render('Carreras/Edit', [
            'carrera' => $carrera,
            'plan' => $plan,
            'materiasEnPlan' => $materiasEnPlan,
            'materiasDisponibles' => $materiasDisponibles,
            'flash' => session()->only(['success', 'error']),
        ]);
    }

    public function desactivar(Request $request, Plan $plan) {
        $carrera = $plan->carrera;
        $this->authorize('update', $carrera);
        $request->validate(['anio_fin' => 'required|date']);
        $plan->update(['anio_fin' => $request->anio_fin]);
        return back()->with('success', 'Plan finalizado correctamente.');
    }
    
    public function destroy(Plan $plan)
    {
        $carrera = $plan->carrera;
        $this->authorize('update', $carrera);
        try {
            $plan->delete();

            return back()->with('success', 'El plan y sus asignaciones han sido eliminados permanentemente.');
            
        } catch (\Exception $e) {
            return back()->with('error', 'No se pudo eliminar el plan. Es posible que tenga registros asociados que lo impidan.');
        }
    }

}

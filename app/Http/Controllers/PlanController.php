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
        $carrera = Carrera::findOrFail($carrera);
        $this->authorize('update', $carrera);

        // Intentamos obtener el plan actual
        $plan_anterior = $carrera->planActual;

        // Si existe el plan, obtenemos sus materias; si no, inicializamos una colección vacía
        if ($plan_anterior) {
            $materiasEnPlanActual = $plan_anterior->materias;
            $materiasEnPlanIds = $materiasEnPlanActual->pluck('id');
        } else {
            $materiasEnPlanActual = collect(); // Colección vacía
            $materiasEnPlanIds = collect();     // IDs vacíos
        }

        // Al estar vacío $materiasEnPlanIds, traerá TODAS las materias de la base de datos
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
        try {

            $validated = $request->validate([
            'carrera_id'    => 'required|exists:carreras,id',
            'anio_comienzo' => 'required|date',
            'materias'      => 'required|array|min:1',
            // Validamos que cada elemento del array tenga el id y el anio
            'materias.*.id'   => 'required|exists:materias,id',
            'materias.*.anio' => 'required|integer|min:1|max:6',
            ]);

            $plan = Plan::create([
                'carrera_id'    => $validated['carrera_id'],
                'anio_comienzo' => $validated['anio_comienzo'],
            ]);

            // Transformamos el array de materias para el formato de attach:
            // [ id_materia => ['anio' => valor], ... ]
            $materiasConPivot = collect($request->materias)->mapWithKeys(function ($materia) {
                return [$materia['id'] => ['anio' => $materia['anio']]];
            })->toArray();

            // Guardamos en la tabla intermedia con el campo extra
            $plan->materias()->attach($materiasConPivot);

            return redirect()->route('carreras.show', $validated['carrera_id'])
                ->with('success', 'Nuevo plan de estudio creado correctamente.');

        } catch (\Exception $e) {
                return redirect()->route('planes.create', $request['carrera_id'])
                    ->with(['error' => 'Ocurrió un error inesperado: ' . $e->getMessage()])
                    ->withInput();
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

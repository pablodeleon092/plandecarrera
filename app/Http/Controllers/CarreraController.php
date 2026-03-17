<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Carrera;
use App\Models\Instituto;
use App\Models\Materia;
use App\Models\Plan;
use Inertia\Inertia;
// ¡Importante! Agregar esto para la validación
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

class CarreraController extends Controller
{
    public function index()
    {
        $filters = request()->only(['search', 'estado']);

        $carreras = Carrera::with('instituto')
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('nombre', 'like', '%' . $search . '%')
                        ->orWhereHas('instituto', function ($query) use ($search) {
                            $query->where('siglas', 'like', '%' . $search . '%');
                        });
                });
            })
            ->when(isset($filters['estado']) && $filters['estado'] !== '', function ($query) use ($filters) {
                $query->where('estado', $filters['estado'] === 'true');
            })
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        $institutos = Instituto::select('id', 'siglas')->get();

        return Inertia::render('Carreras/Index', [
            'carreras' => $carreras,
            'institutos' => $institutos,
            'filters' => $filters,
        ]);
    }

    // --- NUEVO MÉTODO 'CREATE' ---
    // Muestra la vista para crear una nueva carrera
    public function create()
    {
        // Pasamos los institutos para poder mostrarlos en un <select>
        return Inertia::render('Carreras/Create', [
            'institutos' => Instituto::select('id', 'siglas')->get()
        ]);
    }


    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:255|unique:carreras',
                'modalidad' => 'required|string|max:100',
                'sede' => 'required|string|max:100',
                'instituto_id' => 'required|integer|exists:institutos,id',
            ]);

            // Crear la carrera
            Carrera::create([
                'nombre' => $validated['nombre'],
                'instituto_id' => $validated['instituto_id'],
                'modalidad' => $validated['modalidad'],
                'sede' => $validated['sede'],
                'estado' => true,
            ]);

            return Redirect::route('carreras.index')
                ->with('success', 'Carrera creada exitosamente.');

        } catch (\Exception $e) {
            // Vuelve al formulario con el error y los datos cargados
            return Redirect::back()
                ->with(['error' => 'Ocurrió un error al crear la carrera: ' . $e->getMessage()])
                ->withInput();
        }
    }


    // --- NUEVO MÉTODO 'SHOW' ---
    // Muestra una carrera específica
    public function show(Carrera $carrera)
    {
        // Cargamos la relación con instituto (si no viene por defecto)
        $carrera->load([
            'instituto',
            'planes.materias',
            'planActual.materias'
        ]);

        $materias = $carrera->planActual?->materias()
            ->orderBy('cuatrimestre')         
            ->orderBy('nombre', 'desc')        
            ->get() ?? collect([]);

        $planes = $carrera->planes;

        return Inertia::render('Carreras/Show', [
            'carrera' => $carrera,
            'planes' => $planes,
        ]);
    }

    public function toggleStatus(Carrera $carrera)
    {
        $carrera->estado = !$carrera->estado;
        $carrera->save();

        $accion = $carrera->estado ? 'activada' : 'desactivada';
        $mensaje = "La carrera '{$carrera->nombre}' ha sido {$accion}."; // Corrected variable name

        // Redirige a la página anterior con un mensaje de éxito.
        return redirect()->back()->with('success', $mensaje);
    }


    public function edit(Carrera $carrera)
    {
        // Edit temporal modificar cuando definimaos el historial de planes.
        $plan = $carrera->planActual()->first();

        if (!$plan) {
            $plan = $carrera->planes()->create([
                'anio_comienzo' => now()->startOfYear()->toDateString(),
                'anio_fin' => null,
            ]);
        }

        // Obtenemos las materias que ya están en el plan
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

    public function update(Request $request, Carrera $carrera)
    {
        $validated = $request->validate([
            'materias' => 'present|array', // 'present' asegura que la clave 'materias' exista, incluso si el array está vacío
            'materias.*' => 'integer|exists:materias,id', // Valida que cada elemento sea un ID de materia existente
            'plan' => 'required|integer|exists:planes,id'
        ]);

        // Buscamos el plan para asegurarnos de que pertenece a la carrera (por seguridad)
        $plan = $carrera->planes()->findOrFail($validated['plan']);

        // Sincronizamos las materias del plan.
        // sync() se encarga de añadir, eliminar y mantener las relaciones necesarias.
        $plan->materias()->sync($validated['materias']);

        return Redirect::route('carreras.edit', $carrera->id)->with('success', 'Plan de estudios actualizado correctamente.');
    }
}
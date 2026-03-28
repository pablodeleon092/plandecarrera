<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Carrera;
use App\Models\Instituto;
use App\Models\Materia;
use App\Models\Plan;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

class CarreraController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $filters = request()->only(['search', 'estado']);

        $carreras = Carrera::with('instituto')
            ->when(
                $user->hasAnyRole(['Admin_instituto', 'Consulta_instituto']) && $user->instituto_id,
                function ($query) use ($user) {
                    $query->where('instituto_id', $user->instituto_id);
                }
            )
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

    public function create()
    {
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
            return Redirect::back()
                ->with(['error' => 'Ocurrió un error al crear la carrera: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function show(Carrera $carrera)
    {
        $carrera->load([
            'instituto',
            'planActual.materias'
        ]);

        $materias = $carrera->planActual?->materias()
            ->orderBy('cuatrimestre')
            ->orderBy('nombre', 'desc')
            ->get() ?? collect([]);

        return Inertia::render('Carreras/Show', [
            'carrera' => $carrera,
            'materias' => $materias,
        ]);
    }

    public function toggleStatus(Carrera $carrera)
    {
        $carrera->estado = !$carrera->estado;
        $carrera->save();

        $accion = $carrera->estado ? 'activada' : 'desactivada';
        $mensaje = "La carrera '{$carrera->nombre}' ha sido {$accion}.";

        return redirect()->back()->with('success', $mensaje);
    }

    public function edit(Carrera $carrera)
    {
        $plan = $carrera->planActual()->first();

        if (!$plan) {
            $plan = $carrera->planes()->create([
                'anio_comienzo' => now()->startOfYear()->toDateString(),
                'anio_fin' => null,
            ]);
        }

        $materiasEnPlan = $plan->materias()->get();
        $materiasEnPlanIds = $materiasEnPlan->pluck('id');
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
            'materias' => 'present|array',
            'materias.*' => 'integer|exists:materias,id',
            'plan' => 'required|integer|exists:planes,id'
        ]);

        $plan = $carrera->planes()->findOrFail($validated['plan']);
        $plan->materias()->sync($validated['materias']);

        return Redirect::route('carreras.edit', $carrera->id)->with('success', 'Plan de estudios actualizado correctamente.');
    }
}
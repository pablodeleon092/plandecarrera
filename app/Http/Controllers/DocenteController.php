<?php

namespace App\Http\Controllers;

use App\Models\Docente;
use App\Models\Dedicacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreDocenteRequest;
use Inertia\Inertia;

class DocenteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Docente::query();

        // Filtro de acceso por rol
        if ($user->hasAnyRole(['Admin', 'Admin_global'])) {
            // Ven todos los docentes
        } elseif ($user->hasAnyRole(['Admin_instituto', 'Consulta_instituto'])) {
            if ($user->instituto_id) {
                $query->deInstituto($user->instituto_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        } elseif ($user->hasRole('Coord_carrera')) {
            $carreraIds = $user->carreras->pluck('id')->toArray();
            if (!empty($carreraIds)) {
                $query->deInstitutoYCarrera($user->instituto_id, $carreraIds[0]);
            } else {
                $query->whereRaw('1 = 0');
            }
        } else {
            $query->whereRaw('1 = 0');
        }

        // Filtro de búsqueda
        if ($request->has('search') && $request->input('search')) {
            $search = $request->input('search');
            $searchTerms = array_filter(explode(' ', str_replace(',', ' ', $search)));

            $query->where(function ($q) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $q->where(fn($subQuery) => $subQuery->where('nombre', 'ilike', "%{$term}%")
                        ->orWhere('apellido', 'ilike', "%{$term}%")
                        ->orWhere('legajo', 'like', "%{$term}%"));
                }
            });
        }

        // Filtro de estado
        if ($request->filled('es_activo')) {
            $query->where('es_activo', $request->input('es_activo') == '1');
        }

        $docentes = $query->with('cargos')
            ->orderBy('apellido')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Docentes/Index', [
            'docentes' => $docentes,
            'filters' => $request->only(['search', 'es_activo']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Docentes/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDocenteRequest $request)
    {
        Docente::create($request->validated());
        return redirect()->route('docentes.index')->with('success', 'Docente creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Docente $docente)
    {
        $docente->load(['cargos.dedicacion', 'comisiones.materia']);

        return Inertia::render('Docentes/Show', [
            'docente' => $docente,
            'comisiones' => $docente->comisiones
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Docente $docente)
    {
        return Inertia::render('Docentes/Edit', [
            'docente' => $docente->load('cargos'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreDocenteRequest $request, Docente $docente)
    {
        $docente->update($request->validated());
        return redirect()->route('docentes.index')->with('success', 'Docente actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Docente $docente)
    {
        try {
            $docente->delete();
            return redirect()->route('docentes.index')->with('success', 'Docente eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('docentes.index')->with('error', 'No se puede eliminar el docente porque tiene registros asociados.');
        }
    }

    /**
     * Show the form for creating a new cargo.
     */
    public function createCargo(Docente $docente)
    {
        if ($docente->modalidad_desempeño === 'Desarrollo') {
            $dedicaciones = \App\Models\Dedicaciones::whereIn('nombre', ['Simple', 'SemiExclusiva(DP)'])->get();
        } elseif ($docente->modalidad_desempeño === 'Investigador') {
            $dedicaciones = \App\Models\Dedicaciones::whereIn('nombre', ['SemiExclusiva(DI)', 'Exclusiva'])->get();
        }

        return Inertia::render('Docentes/Cargos/Create', [
            'docente' => $docente->load('cargos'),
            'dedicaciones' => $dedicaciones,
        ]);
    }

    public function toggleStatus(Docente $docente)
    {
        $docente->es_activo = !$docente->es_activo;
        $docente->save();

        return back();
    }
}
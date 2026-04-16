<?php

namespace App\Http\Controllers;

use App\Models\Dedicacion;
use App\Models\Materia;
use App\Models\Instituto;
use App\Models\Carrera;
use App\Models\User;
use App\Models\Docente;
use App\Models\Dedicaciones;
use App\Models\Dicta;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Services\ReportService;
use App\Services\QueryFilter;
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

        $this->authorize('viewAny', Docente::Class);
        $query = Docente::query()->with(['cargos.dedicacion']);

        $queryFilter = new QueryFilter;

        $filters = $request->all();

        $queryFilter->apply($query, $filters);

        $docentes = $query->with([
                'cargos',
                'dictas.comision.materia' 
        ])
        ->orderBy('apellido')
        ->paginate(15)
        ->withQueryString();

        $institutosDisponibles = $user->getInstitutosAutorizados();
        
        $carreras = $institutosDisponibles->flatMap(function ($instituto) {
            return $instituto->carreras;
        })->values();
        
        $dedicaciones = Dedicaciones::all();

        return Inertia::render('Docentes/Index', [
            'docentes' => $docentes,
            'institutos' => $institutosDisponibles,
            'carreras' => $carreras,
            'dedicaciones' => $dedicaciones,
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
        $this->authorize('create', Docente::Class);
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
        $this->authorize('update', Docente::Class);
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
        $this->authorize('modificar_docente', Docente::Class);
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
        $this->authorize('create', Docente::Class);
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
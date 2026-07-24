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
use Illuminate\Support\Facades\DB;
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

        $filters = $request->input('filters', []);
        $search = $request->input('search');

        $queryFilter->apply($query, $filters);
        $queryFilter->applySearch($query, $search, ['nombre', 'apellido', 'legajo']);

        $docentes = $query->with([
                'cargos',
                'dictas.comision.materia' 
            ])
            ->orderBy('apellido', 'asc')
            ->orderBy('nombre', 'asc')
            ->get()
            ->map(fn ($docente) => [
                'id'                  => $docente->id,
                'legajo'              => $docente->legajo,
                'nombre'              => $docente->nombre,
                'apellido'            => $docente->apellido,
                'nombre_completo'     => "{$docente->apellido}, {$docente->nombre}",
                'modalidad_desempeño' => $docente->modalidad_desempeño,
                'carga_horaria'       => $docente->carga_horaria,
                'es_activo'              => (bool) $docente->es_activo, // Usamos 'estado' para que DataTable lo reconozca
                'telefono'            => $docente->telefono,
                'email'               => $docente->email,

                // Mapeo de Cargos
                'cargos' => $docente->cargos->map(fn ($cargo) => [
                    'id'     => $cargo->id,
                    'nombre' => $cargo->nombre, // Asumiendo que 'nombre' es la columna en cargos
                ]),
                'materias' => $docente->dictas->map(fn ($dicta) => [
                    'id' => $dicta->comision?->materia?->id,
                    'nombre'  => $dicta->comision?->materia?->nombre,
                ])->filter(fn($m) => $m['nombre'] != null)->values(),

                'can' => [
                    'view'   => $user->can('consultar_docente'),
                    'update' => $user->can('update', $docente),
                    'delete' => $user->can('delete', $docente),
                ]
            ]);

        $institutosDisponibles = $user->getInstitutosAutorizados();
        
        $carreras = $institutosDisponibles->flatMap(function ($instituto) {
            return $instituto->carreras;
        })->values();
        
        $dedicaciones = Dedicaciones::all();

        #dd($docentes);

        return Inertia::render('Docentes/Index', [
            'docentes' => $docentes,
            'institutos' => $institutosDisponibles,
            'carreras' => $carreras,
            'filters' => $filters,
            'search' => $search,
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
        $this->authorize('create', Docente::Class);
        Docente::create($request->validated());
        return redirect()->route('docentes.index')->with('success', 'Docente creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Docente $docente)
    {
        $this->authorize('viewAny', Docente::Class);
        $user = auth()->user();
        $docente->load(['cargos.dedicacion', 'comisiones.materia']);

        return Inertia::render('Docentes/Show', [
            'docente' => $docente,
            'comisiones' => $docente->comisiones,
            'can' => [
                'update' => $user->can('update', $docente),
                'delete' => $user->can('delete', $docente),
                'manageCargos' => $user->can('manageCargos', $docente),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Docente $docente)
    {
        $this->authorize('update', $docente);
        $user = auth()->user();

        return Inertia::render('Docentes/Edit', [
            'docente' => $docente->load('cargos'),
            'can' => [
                'editLegajo' => $user->can('editLegajo', $docente),
                'manageCargos' => $user->can('manageCargos', $docente),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreDocenteRequest $request, Docente $docente)
    {
        $user = auth()->user();
        if ($user->cannot('update', $docente)) {
            $rol = str_replace('_', ' ', $user->getRoleNames()->first() ?? 'usuario');
            $institutoNombre = $user->instituto?->nombre ?? 'tu instituto';
            return redirect()->back()->with('error', "Como {$rol} del {$institutoNombre}, solo puedes editar docentes de tu propio instituto.");
        }
        
        $docente->update($request->validated());
        return redirect()->route('docentes.index')->with('success', 'Docente actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Docente $docente)
    {
        $this->authorize('delete', $docente);

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
    public function createCargo(Request $request, Docente $docente)
    {
        $this->authorize('manageCargos', $docente);
        $validated = $request->validate([
            'comision_id' => 'nullable|integer|exists:comisiones,id',
        ]);
        if ($docente->modalidad_desempeño === 'Desarrollo') {
            $dedicaciones = \App\Models\Dedicaciones::whereIn('nombre', ['Simple', 'SemiExclusiva(DP)'])->get();
        } elseif ($docente->modalidad_desempeño === 'Investigador') {
            $dedicaciones = \App\Models\Dedicaciones::whereIn('nombre', ['SemiExclusiva(DI)', 'Exclusiva'])->get();
        }

        return Inertia::render('Docentes/Cargos/Create', [
            'docente' => $docente->load('cargos'),
            'dedicaciones' => $dedicaciones,
            'comisionId' => $validated['comision_id'] ?? null,
        ]);
    }

    /**
     * Muestra la pantalla de selección para eliminar cargos del docente.
     */
    public function eliminarCargos(Docente $docente)
    {
        $this->authorize('manageCargos', $docente);
        $docente->load('cargos.dedicacion');

        return Inertia::render('Docentes/Cargos/Delete', [
            'docente' => $docente,
            'cargos' => $docente->cargos,
        ]);
    }

    /**
     * Elimina uno o varios cargos del docente y redirige a su ficha.
     */
    public function destroyCargos(Request $request, Docente $docente)
    {
        $this->authorize('manageCargos', $docente);

        $validated = $request->validate([
            'cargo_ids' => 'required|array|min:1',
            'cargo_ids.*' => 'integer|exists:cargos,id',
        ]);

        DB::transaction(function () use ($docente, $validated) {
            // Scopeado por el docente: imposible borrar cargos de otro docente.
            $docente->cargos()->whereIn('id', $validated['cargo_ids'])->delete();
        });

        return redirect()
            ->route('docentes.show', $docente->id)
            ->with('success', 'Cargo(s) eliminado(s) correctamente.');
    }

    public function toggleStatus(Docente $docente)
    {
        $this->authorize('restore', $docente);
        $docente->es_activo = !$docente->es_activo;
        $docente->save();

        return back();
    }
        
}

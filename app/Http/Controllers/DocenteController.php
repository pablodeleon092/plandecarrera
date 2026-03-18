<?php

namespace App\Http\Controllers;

use App\Models\Dedicacion;
use App\Models\Materia;
use App\Models\Instituto;
use App\Models\Carrera;
use App\Models\User;
use App\Models\Docente;
use App\Models\Dicta;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Services\ReportService;
use App\Http\Requests\StoreDocenteRequest;
use Inertia\Inertia;

class DocenteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Docente::query()->with(['cargos.dedicacion']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $searchTerms = array_filter(explode(' ', str_replace(',', ' ', $search)));

            $query->where(function ($q) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $q->where(function ($sub) use ($term) {
                        $sub->where('nombre', 'ilike', "%{$term}%")
                            ->orWhere('apellido', 'ilike', "%{$term}%")
                            ->orWhere('legajo', 'like', "%{$term}%");
                    });
                }
            });
        }

        if ($request->filled('cargos')) {
            $cargoTerm = $request->input('cargos');
            $query->whereHas('cargos', function ($q) use ($cargoTerm) {
                $q->where('nombre', 'ilike', "%{$cargoTerm}%");
            });
        }

        if ($request->filled('es_activo')) {
            $query->where('es_activo', $request->boolean('es_activo'));
        }

        if ($request->filled('instituto_id') && $request->filled('carrera_id')) {
            $query->deInstitutoYCarrera($request->instituto_id, $request->carrera_id);
            
        } else if ($request->filled('instituto_id'))
        {
            $query->deInstituto($request->instituto_id);
        }

        if ($request->filled('materia')) {
            $materiaTerm = $request->input('materia');
            $query->whereHas('dictas.comision.materia', function ($q) use ($materiaTerm) {
                $q->where('nombre', 'ilike', "%{$materiaTerm}%");
            });
        }

        $docentes = $query->with([
                'cargos',
                'dictas.comision.materia' 
        ])
        ->orderBy('apellido')
        ->paginate(15)
        ->withQueryString();

        $user = Auth::user();
        $institutosDisponibles = $this->getInstitutosPorRol($user);
        $carreras = collect();
        
        if ($request->filled('instituto_id')) {
            $carreras = Carrera::where('instituto_id', $request->instituto_id)
                ->orderBy('nombre')
                ->get(['id', 'nombre']);
        }

        return Inertia::render('Docentes/Index', [
            'docentes' => $docentes,
            'institutos' => $institutosDisponibles,
            'carreras' => $carreras,
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
    /**
     * Display the specified resource.
     */
    public function show(Docente $docente)
    {
        // Cargar relaciones: Cargos (con dedicación) Y Comisiones (con materia)
        $docente->load(['cargos.dedicacion', 'comisiones.materia']);

        return Inertia::render('Docentes/Show', [
            'docente' => $docente,
            // Pasamos las comisiones por separado para usarlas fácil en el frontend
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
     *
     * @param Docente $docente
     * @return \Inertia\Response
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

    private function getDocentesFiltrados($selectedInstitutoId, $selectedCarreraId)
    {
        if (!$selectedInstitutoId) {
            return collect();
        }

        $query = Docente::query();

        if ($selectedCarreraId && $selectedCarreraId !== 'all') {
            $query->deInstitutoYCarrera($selectedInstitutoId, $selectedCarreraId);
        } else {
            $query->deInstituto($selectedInstitutoId);
        }

        $docentes = $query->with([
            'cargos.dedicacion',
            'comisiones.materia',
        ])
            ->orderBy('apellido')
            ->paginate(15)
            ->withQueryString();

        $docentes->through(function ($doc) {

            return [
                'id' => $doc->id,
                'nombre' => $doc->nombre . ' ' . $doc->apellido,
                'modalidad' => $doc->modalidad_desempeño,
                'horas' => $doc->carga_horaria,

                'cargos' => $doc->cargos->map(function ($cargo) {
                    return [
                        'nombre' => $cargo->nombre,
                        'dedicacion' => $cargo->dedicacion?->nombre,
                    ];
                })->values(),

                'materias' => $doc->comisiones->map(fn($c) => $c->materia->nombre)
                    ->unique()
                    ->values(),
            ];
        });

        return $docentes;
    }
    
    private function getInstitutosPorRol(User $user)
    {
        $rol = $user->cargo;

        if (in_array($rol, ['Administrador', 'Administrativo de Secretaria Academica'])) {

            return Instituto::with('carreras.planActual')->get(['id', 'nombre']);

        } elseif (in_array($rol, ['Administrativo de instituto', 'Director de instituto', 'Coordinador Academico', 'Consejero'])) {

            $user->instituto->load([
                'carreras' => function ($query) {
                    $query->with('planActual');
                }
            ]);
            return collect([$user->instituto]);

        } elseif ($rol === 'Coordinador de Carrera') {

            $user->instituto->load([
                'carreras' => function ($query) use ($user) {

                    $carreraIds = $user->carreras()->pluck('carrera_id');

                    $query->whereIn('id', $carreraIds)
                        ->with('planActual');
                }
            ]);



            return collect([$user->instituto]);

        } else {

            return collect();
        }
    }

    public function exportar(Request $request, ReportService $reportService)
    {
        try {
          
            $path = $reportService->generarDocentesPdf($request);

  
            if (!$path || !file_exists($path)) {
                return back()->with('error', 'Error: El motor Jasper no generó el archivo. Verifique la configuración de Java en el servidor.');
            }

     
            return response()->download($path, 'mapa_de_carreras.pdf', [
                'Content-Type' => 'application/pdf',
            ])->deleteFileAfterSend(true); 
            
        } catch (\Exception $e) {
            \Log::error("Error en reporte Jasper: " . $e->getMessage());
            
            return back()->with('error', 'Error en el reporte: ' . $e->getMessage());
        }
    }  
    
}
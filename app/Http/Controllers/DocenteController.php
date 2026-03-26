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

        $user = Auth::user();
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
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Carrera;
use App\Services\QueryFilter;
use App\Models\Instituto;
use App\Models\Materia;
use App\Models\Plan;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

class CarreraController extends Controller
{
    public function index(Request $request)
    {
        // 1. Autorización básica para ver el listado
        $this->authorize('viewAny', Carrera::class);
        $user = Auth::user();

        $query = Carrera::query();
  
        // 2. Aplicación de alcances (Scopes) según Rol
        if ($user->hasAnyRole(['Admin', 'Admin_global', 'coord_academico'])) {
            // Acceso completo
        } elseif ($user->hasAnyRole(['Admin_instituto', 'Consulta_instituto'])) {
            if ($user->instituto_id) {
                $carreraIds = $user->instituto->carreras()->pluck('id')->toArray();
                $query->whereIn('id', $carreraIds);
            } else {
                $query->whereRaw('1 = 0');
            }
        } elseif ($user->hasRole('Coord_carrera')) {
            $carreraIds = $user->carreras()->pluck('carrera_id')->toArray();
            if (!empty($carreraIds)) {
                $query->whereIn('id', $carreraIds);
            } else {
                $query->whereRaw('1 = 0');
            }
        } else {
            $query->whereRaw('1 = 0');
        }

        // 3. Filtros de búsqueda
        $queryFilter = new QueryFilter;
        $filters = $request->all();
        $queryFilter->apply($query, $filters);

        // 4. Paginación y Transformación (Aquí inyectamos los permisos)
        $carreras = $query
            ->with('instituto') // <--- Carga la relación aquí
            ->orderBy('nombre', 'asc')
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($carrera) => [
                'id' => $carrera->id,
                'nombre' => $carrera->nombre,
                'instituto_id' => $carrera->instituto_id,
                // Incluimos el objeto instituto con los campos necesarios
                'instituto' => $carrera->instituto ? [
                    'id' => $carrera->instituto->id,
                    'nombre' => $carrera->instituto->nombre,
                    'siglas' => $carrera->instituto->siglas,
                ] : null,
                'modalidad' => $carrera->modalidad, // Corregido el typo 'modaliad'
                'sede' => $carrera->sede,
                'estado' => $carrera->estado,
                'can' => [
                    'view'   => $user->can('consultar_carrera', $carrera),
                    'update' => $user->can('modificar_carrera', $carrera),
                    'delete' => $user->can('restore_carrera', $carrera),
                ]
            ]);
            
        $institutos = $user->getInstitutosAutorizados();

        return Inertia::render('Carreras/Index', [
            'carreras'   => $carreras,
            'institutos' => $institutos,
            'filters'    => $filters,
            'can' => [
                'create' => $user->can('crear_carrera'),
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('create', Carrera::class);
        return Inertia::render('Carreras/Create', [
            'institutos' => Instituto::select('id', 'siglas')->get()
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Carrera::class);
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:255|unique:carreras',
                'modalidad' => 'required|string|max:100',
                'sede' => 'required|string|max:100',
                'instituto_id' => 'required|integer|exists:institutos,id',
            ]);

            // SEGURIDAD: Verificar que el instituto_id sea el del usuario
            $user = auth()->user();
            if ($user->instituto_id && $validated['instituto_id'] != $user->instituto_id) {
                $institutoNombre = $user->instituto?->nombre ?? 'tu instituto';
                return redirect()->back()->with('error', "Como director del {$institutoNombre}, no puedes crear carreras en otro instituto.");
            }

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
        $this->authorize('view', $carrera);
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
        $user = auth()->user();
        if ($user->cannot('restore', $carrera)) {
            $rolesFriendly = [
                'Admin_instituto' => 'Director de instituto',
                'Coord_carrera' => 'Coordinador de carrera',
            ];
            $rol = $rolesFriendly[$user->getRoleNames()->first()] ?? 'usuario';
            $institutoNombre = $user->instituto?->nombre ?? 'tu instituto';
            return redirect()->back()->with('error', "Como {$rol} del {$institutoNombre}, solo puedes editar carreras de tu propio instituto.");
        }
        $carrera->estado = !$carrera->estado;
        $carrera->save();

        $accion = $carrera->estado ? 'activada' : 'desactivada';
        $mensaje = "La carrera '{$carrera->nombre}' ha sido {$accion}.";

        return redirect()->back()->with('success', $mensaje);
    }

    public function edit(Carrera $carrera)
    {
        $user = auth()->user();
        if ($user->cannot('update', $carrera)) {
            $rolesFriendly = [
                'Admin_instituto' => 'Director de instituto',
                'Coord_carrera' => 'Coordinador de carrera',
            ];
            $rol = $rolesFriendly[$user->getRoleNames()->first()] ?? 'usuario';
            $institutoNombre = $user->instituto?->nombre ?? 'tu instituto';
            return redirect()->back()->with('error', "Como {$rol} del {$institutoNombre}, solo puedes editar carreras de tu propio instituto.");
        }
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
        $user = auth()->user();
        if ($user->cannot('update', $carrera)) {
            $rolesFriendly = [
                'Admin_instituto' => 'Director de instituto',
                'Coord_carrera' => 'Coordinador de carrera',
            ];
            $rol = $rolesFriendly[$user->getRoleNames()->first()] ?? 'usuario';
            $institutoNombre = $user->instituto?->nombre ?? 'tu instituto';
            return redirect()->back()->with('error', "Como {$rol} del {$institutoNombre}, solo puedes editar carreras de tu propio instituto.");
        }
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

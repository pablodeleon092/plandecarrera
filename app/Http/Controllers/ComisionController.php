<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comision;
use App\Models\User;
use App\Models\Materia;
use Inertia\Inertia;
use App\Models\Instituto;
use App\Models\Carrera;
use App\Services\QueryFilter;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ComisionController extends Controller
{

    public function index(Request $request)
    {
        $this->authorize('viewAny', Comision::class);
        $user = Auth::user();

        $query = Comision::query();

  
        if ($user->hasAnyRole(['Admin', 'Admin_global','coord_academico'])) {
            // Acceso completo a todas las comisiones

        } elseif ($user->hasAnyRole(['Admin_instituto', 'Consulta_instituto'])) {
            if ($user->instituto_id) {
                $query->byInstituto($user->instituto_id);
            } else {
                $query->whereRaw('1 = 0');
            }
        } elseif ($user->hasRole('Coord_carrera')) {

            $carreraIds = $user->carreras->pluck('id')->toArray();

            if (!empty($carreraIds)) {
                $query->byCarreras($carreraIds);
            } else {
                $query->whereRaw('1 = 0');
            }
        } else {
            $query->whereRaw('1 = 0');
        }

        $queryFilter = new QueryFilter;

        $filters = $request->all();
       
        $queryFilter->apply($query, $filters);

        $comisiones = $query
            ->with(['materia', 'horarios']) // Eager loading para evitar N+1
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($comision) => [
                'id'              => $comision->id,
                'codigo'          => $comision->codigo,
                'nombre'          => $comision->nombre,
                'turno'           => $comision->turno,
                'modalidad'       => $comision->modalidad,
                'sede'            => $comision->sede,
                'anio'            => $comision->anio,
                'cuatrimestre'    => $comision->cuatrimestre,
                'estado'          => (bool) $comision->estado,
                'horas_totales'   => $comision->horas_totales,
                // Relación con Materia (para mostrar el nombre en la tabla)
                'materia' => $comision->materia ? [
                    'id'     => $comision->materia->id,
                    'nombre' => $comision->materia->nombre,
                ] : null,
                'horarios' => $comision->horarios->map(fn ($horario) => [
                        'id'          => $horario->id,
                        'dia_semana'  => $horario->dia_semana,
                        'hora_inicio' => $horario->hora_inicio,
                        'hora_fin'    => $horario->hora_fin,
                    ]),
                // Permisos específicos del modelo Comisión
                'can' => [
                    'view'   => $user->can('consultar_comision', $comision),
                    'update' => $user->can('modificar_comision', $comision),
                    'delete' => $user->can('restore_comision', $comision),
                ]
            ]);
            
        $institutosDisponibles = $user->getInstitutosAutorizados();
        
        $carreras = $institutosDisponibles->flatMap(function ($instituto) {
            return $instituto->carreras;
        })->values();

        return Inertia::render('Comisiones/Index', [
            'comisiones' => $comisiones,
            'carreras' => $carreras,
            'institutos' => $institutosDisponibles,
            'filters' => $request->all()
        ]);
    }

    public function show($id)
    {
        $comision = Comision::with('materia', 'horarios')->findOrFail($id);
        $this->authorize('view', $comision); 
        $docentes = $comision->dictas()->exists() 
            ? $comision->docentes_with_cargo
            : collect(); // colección vacía
        $allDocentes = \App\Models\Docente::where('es_activo',true)->get();

        return Inertia::render('Comisiones/Show', [
            'comision' => $comision,
            'docentes' => $docentes,
            'allDocentes' => $allDocentes,
        ]);
    }

    public function create(Request $request)
    {
        $this->authorize('create', Comision::class);
        $materiaId = $request->old('id_materia') ?? $request->query('materia_id');
      
        $materia = Materia::findOrFail($materiaId);

        return Inertia::render('Comisiones/Create', [
            'materia' => $materia,
        ]);
    }
    
    public function edit($id)
    {
        $comision = Comision::with('materia', 'horarios')->findOrFail($id);
        $this->authorize('update', $comision);
        $materias = \App\Models\Materia::where('estado', true)->get()->map(function ($materia) {
            return [
                'id' => $materia->id,
                'nombre' => $materia->nombre,
                'codigo' => $materia->codigo,
            ];
        });

        return Inertia::render('Comisiones/Edit', [
            'materias' => $materias,
            'comision' => $comision,
        ]);
    }


    public function update(Request $request, $id)
    {
        $comision = Comision::with('materia', 'horarios')->findOrFail($id);
        
        $user = auth()->user();
        if ($user->cannot('update', $comision)) {
            $rolesFriendly = [
                'Admin_instituto' => 'Director de instituto',
                'Coord_carrera' => 'Coordinador de carrera',
            ];
            $rol = $rolesFriendly[$user->getRoleNames()->first()] ?? 'usuario';
            $institutoNombre = $user->instituto?->nombre ?? 'tu instituto';
            return redirect()->back()->with('error', "Como {$rol} del {$institutoNombre}, solo puedes editar comisiones de tu propio instituto.");
        }
        try {
            $validated = $request->validate([
                'codigo' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique('comisiones', 'codigo')->ignore($comision->id),
                ],
                'nombre' => 'required|string|max:255',
                'turno' => 'required|in:Mañana,Tarde',
                'modalidad' => 'required|in:presencial,virtual,mixto',
                'cuatrimestre' => 'required|in:1ro,2do',
                'sede' => 'required|string|max:255',
                'anio' => 'required|integer|min:2000|max:2100',
                'id_materia' => 'required|exists:materias,id',
                'horas_teoricas' => 'required|integer|min:0',
                'horas_practicas' => 'required|integer|min:0',
                'horas_totales' => 'required|integer|min:0',               
            ], [
                'codigo.required' => 'El código es obligatorio',
                'codigo.unique' => 'Este código ya está en uso',
                'nombre.required' => 'El nombre es obligatorio',
                'turno.required' => 'Debe seleccionar el turno',
                'modalidad.required' => 'Debe seleccionar la modalidad',
                'cuatrimestre.required' => 'Debe seleccionar el cuatrimestre',
                'sede.required' => 'La sede es obligatoria',
                'anio.required' => 'El año es obligatorio',
                'id_materia.required' => 'Debe seleccionar una materia válida',
            ]);

            $materia = \App\Models\Materia::findOrFail($validated['id_materia']);
            $validated['horas_totales'] = $validated['horas_teoricas'] + $validated['horas_practicas'];

            if ($validated['horas_totales'] != $materia->horas_semanales) {
                return redirect()->back()
                    ->with(['error' => 'Las horas deben ser exactamente '.$materia->horas_semanales.'.'])
                    ->withInput();
            }

            $comision->update($validated);

            return redirect()->route('comisiones.index')->with('success', 'Comisión actualizada exitosamente.');

        } catch (\Throwable $e) {
            return redirect()->back()
                ->with(['error' => 'Ocurrió un error inesperado: ' . $e->getMessage()])
                ->withInput();
        }
    }

    
    public function store(Request $request) {
        $this->authorize('create', Comision::class);
        try {
            $validated = $request->validate([
                'codigo' => 'required|string|max:50|unique:comisiones,codigo',
                'nombre' => 'required|string|max:255',
                'turno' => 'required|in:Mañana,Tarde',
                'modalidad' => 'required|in:presencial,virtual,mixto',
                'cuatrimestre' => 'required|in:1ro,2do',
                'sede' => 'required|string|max:255',
                'anio' => 'required|integer|min:2000|max:2100',
                'id_materia' => 'required|exists:materias,id',
                'horas_teoricas' => 'required|integer|min:0',
                'horas_practicas' => 'required|integer|min:0',
                'horas_totales' => 'required|integer|min:0',               
            ], [
                'codigo.required' => 'El código es obligatorio',
                'codigo.unique' => 'Este código ya está en uso',
                'nombre.required' => 'El nombre es obligatorio',
                'turno.required' => 'Debe seleccionar el turno',
                'modalidad.required' => 'Debe seleccionar la modalidad',
                'cuatrimestre.required' => 'Debe seleccionar el cuatrimestre',
                'sede.required' => 'La sede es obligatoria',
                'anio.required' => 'El año es obligatorio',
                'id_materia.required' => 'Debe seleccionar una materia válida',
            ]);

            // SEGURIDAD: Verificar que la materia pertenezca al instituto del usuario
            $materia = \App\Models\Materia::findOrFail($validated['id_materia']);
            $user = auth()->user();
            if ($user->instituto_id && $materia->carrera->instituto_id != $user->instituto_id) {
                $institutoNombre = $user->instituto?->nombre ?? 'tu instituto';
                return redirect()->back()->with('error', "Como director del {$institutoNombre}, no puedes crear comisiones en una materia de otro instituto.");
            }

            $validated['horas_totales'] = $validated['horas_teoricas'] + $validated['horas_practicas'];

            if ($validated['horas_totales'] > $materia->horas_semanales) {
                return redirect()->back()->withErrors(['horas_teoricas' => 'La suma de horas teóricas y prácticas no puede exceder las horas totales de la materia.'])->withInput();
            } else if ($validated['horas_totales'] < $materia->horas_semanales) {
                return redirect()->back()->withErrors(['horas_teoricas' => 'La suma de horas teóricas y prácticas no puede ser menor que las horas totales de la materia.'])->withInput();
            }

            Comision::create($validated);

            return redirect()->route('materias.show', $materia->id)->with('success', 'Comisión creada exitosamente.');

        }   catch (\Throwable $e) {

                return redirect()->route('comisiones.create')
                    ->with(['error' => 'Ocurrió un error inesperado: ' . $e->getMessage()])
                    ->withInput();
        }
    
    }

    public function destroy($id)
    {
        try {
            $comision = Comision::findOrFail($id);
            $materia = $comision->materia;

            $user = auth()->user();
            if ($user->cannot('delete', $comision)) {
                $rolesFriendly = [
                    'Admin_instituto' => 'Director de instituto',
                    'Coord_carrera' => 'Coordinador de carrera',
                ];
                $rol = $rolesFriendly[$user->getRoleNames()->first()] ?? 'usuario';
                $institutoNombre = $user->instituto?->nombre ?? 'tu instituto';
                return redirect()->back()->with('error', "Como {$rol} del {$institutoNombre}, solo puedes eliminar comisiones de tu propio instituto.");
            }
            $comision->delete();
            return redirect()->route('materias.show', $materia->id)->with('success', 'Comision eliminada.');
        } catch (\Exception $e) {
  
            return redirect()->route('materias.show', $materia->id)->with('error', 'No se puede eliminar la comision.' . $e->getMessage());
        }
    }

    public function toggleStatus(Comision $comision)
    {
        $user = auth()->user();
        if ($user->cannot('restore', $comision)) {
            $rolesFriendly = [
                'Admin_instituto' => 'Director de instituto',
                'Coord_carrera' => 'Coordinador de carrera',
            ];
            $rol = $rolesFriendly[$user->getRoleNames()->first()] ?? 'usuario';
            $institutoNombre = $user->instituto?->nombre ?? 'tu instituto';
            return redirect()->back()->with('error', "Como {$rol} del {$institutoNombre}, solo puedes editar comisiones de tu propio instituto.");
        }
        $comision->estado = !$comision->estado;
        $comision->save();

        return redirect()->route('comisiones.index')
            ->with('success', 'Estado de la comisión actualizado exitosamente.');
    }



}

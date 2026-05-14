<?php

namespace App\Dashboards;

use App\Contracts\DashboardStrategy;
use App\Models\User;
use App\Models\Docente;
use App\Models\Comision;
use App\Models\Materia;
use App\Models\Carrera;
use App\Models\Dicta;
use App\Models\Instituto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class AdministrativoDeInstitutoDashboard implements DashboardStrategy
{
    public function render(User $user, Request $request): Response
    {
        $institutoId = $user->instituto_id;
        
        if ($user->cargo === 'Administrador') {
            $institutoId = $request->input('instituto_id') ?? Instituto::first()?->id;
        } else {
            if (!$institutoId) {
                abort(403, 'Usuario sin instituto asignado');
            }
        }

        $instituto = Instituto::with('carreras')->findOrFail($institutoId);
        
        // Cálculo de período lectivo
        $currentYear = date('Y');
        $currentMonth = (int)date('m');
        $currentSemester = ($currentMonth >= 1 && $currentMonth <= 7) ? 1 : 2;

        return Inertia::render('Gestion/DashboardAdministrativo', [
            'user' => $user,
            'instituto' => $instituto,
            'currentYear' => $currentYear,
            'currentSemester' => $currentSemester,
            
            // Datos operativos
            'datosIncompletos' => $this->getDocentesConDatosIncompletos($institutoId),
            'comisionesActuales' => $this->getComisionesCuatrimestreActual($institutoId, $currentYear, $currentSemester), #revisar este metodo con materiar anuales
            'docentesActivos' => $this->getDocentesActivos($institutoId),
            'tareasPendientes' => $this->getTareasPendientes($institutoId, $currentYear, $currentSemester), #revisar este metodo
            'cambiosRecientes' => $this->getCambiosRecientes($institutoId),
            
            // Análisis y KPIs
            'kpis' => $this->calculateKPIs($institutoId, $currentYear, $currentSemester),
            'materiasCompartidas' => $this->getMateriasCompartidas($institutoId),
            'docentesMultiCarrera' => $this->getDocentesMultiCarrera($institutoId),
            'conflictosHorarios' => $this->getConflictosHorarios($institutoId, $currentYear, $currentSemester),
            'totalCarreras' => Carrera::where('instituto_id', $institutoId)->count(),
            'visionGeneral' => $this->getVisionGeneral($institutoId),
        ]);
    }

    private function getDocentesConDatosIncompletos($institutoId)
    {
        $docentes = Docente::query()
            ->deInstituto($institutoId)
            ->where(function($q) {
                $q->whereNull('email')
                  ->orWhereNull('telefono')
                  ->orWhere('email', '')
                  ->orWhere('telefono', '');
            })
            ->select('id', 'nombre', 'apellido', 'email', 'telefono', 'legajo')
            ->orderBy('apellido')
            ->limit(20)
            ->get()
            ->map(fn($docente) => [
                'id' => $docente->id,
                'nombre_completo' => "{$docente->apellido}, {$docente->nombre}",
                'legajo' => $docente->legajo,
                'email' => $docente->email,
                'telefono' => $docente->telefono,
                'campos_faltantes' => array_filter([
                    empty($docente->email) ? 'Email' : null,
                    empty($docente->telefono) ? 'Teléfono' : null
                ]),
            ]);

        return [
            'total' => $docentes->count(),
            'docentes' => $docentes,
        ];
    }

    private function getComisionesCuatrimestreActual($institutoId, $year, $semester)
    {
        $semesterString = $semester == 1 ? "1ro" : "2do";

        $comisiones = Comision::query()
            ->where('anio', $year)
            ->where('cuatrimestre', $semesterString)
            ->whereHas('materia.planes.carrera', fn($q) => $q->where('instituto_id', $institutoId))
            ->with([
                'materia:id,nombre,codigo',
                'dictas.docente:id,nombre,apellido',
                'dictas.cargo:id,nombre'
            ])
            ->orderBy('id_materia')
            ->limit(30)
            ->get()
            ->map(fn($comision) => [
                'id' => $comision->id,
                'codigo' => $comision->codigo,
                'nombre' => $comision->nombre,
                'materia' => $comision->materia->nombre,
                'turno' => $comision->turno,
                'modalidad' => $comision->modalidad,
                'docentes' => $comision->dictas->map(fn($dicta) => [
                    'nombre' => "{$dicta->docente->apellido}, {$dicta->docente->nombre}",
                    'cargo' => $dicta->cargo->nombre ?? 'Sin cargo',
                ]),
                'total_docentes' => $comision->dictas->count(),
            ]);

        return [
            'total' => $comisiones->count(),
            'comisiones' => $comisiones,
        ];
    }

    private function getDocentesActivos($institutoId)
    {
        $docentes = Docente::query()
            ->where('es_activo', true)
            ->deInstituto($institutoId)
            ->with(['cargos.dedicacion', 'comisiones.materia:id,nombre'])
            ->orderBy('apellido')
            ->limit(20)
            ->get()
            ->map(function($docente) {
                $materias = $docente->comisiones->pluck('materia.nombre')->unique()->values();
                return [
                    'id' => $docente->id,
                    'nombre_completo' => "{$docente->apellido}, {$docente->nombre}",
                    'email' => $docente->email,
                    'telefono' => $docente->telefono,
                    'carga_horaria' => $docente->carga_horaria,
                    'modalidad' => $docente->modalidad_desempeño,
                    'materias' => $materias,
                    'total_materias' => $materias->count(),
                ];
            });

        return ['total' => $docentes->count(), 'docentes' => $docentes];
    }

    private function getTareasPendientes($institutoId, $year, $semester)
    {
        $materiasSinComision = Materia::query()
            ->where('estado', true)
            ->where('cuatrimestre', $semester)
            ->whereHas('planes', fn($q) => $q->whereNull('anio_fin')->whereHas('carrera', fn($c) => $c->where('instituto_id', $institutoId)))
            ->whereDoesntHave('comisiones', fn($q) => $q->where('anio', $year)->where('cuatrimestre', $semester))
            ->select('id', 'nombre', 'codigo')
            ->get()
            ->map(fn($m) => ['id' => $m->id, 'nombre' => $m->nombre, 'codigo' => $m->codigo, 'tipo' => 'Sin comisión creada']);

        $comisionesSinDocentes = Comision::query()
            ->where('anio', $year)
            ->where('cuatrimestre', $semester)
            ->whereHas('materia.planes.carrera', fn($q) => $q->where('instituto_id', $institutoId))
            ->whereDoesntHave('dictas')
            ->with('materia:id,nombre,codigo')
            ->get()
            ->map(fn($c) => ['id' => $c->id, 'nombre' => "{$c->materia->nombre} - {$c->nombre}", 'codigo' => $c->codigo, 'tipo' => 'Sin docentes asignados']);

        $tareas = $materiasSinComision->concat($comisionesSinDocentes);

        return ['total' => $tareas->count(), 'tareas' => $tareas];
    }

    private function getCambiosRecientes($institutoId)
    {
        $cambios = Dicta::query()
            ->whereHas('comision.materia.planes.carrera', fn($q) => $q->where('instituto_id', $institutoId))
            ->with(['docente:id,nombre,apellido', 'comision.materia:id,nombre', 'cargo:id,nombre'])
            ->orderBy('updated_at', 'desc')
            ->limit(20)
            ->get()
            ->map(fn($d) => [
                'id' => $d->id,
                'docente' => "{$d->docente->apellido}, {$d->docente->nombre}",
                'materia' => $d->comision->materia->nombre,
                'comision' => $d->comision->nombre,
                'cargo' => $d->cargo->nombre ?? 'Sin cargo',
                'fecha' => $d->updated_at->format('d/m/Y H:i'),
                'fecha_relativa' => $d->updated_at->diffForHumans(),
            ]);

        return ['total' => $cambios->count(), 'cambios' => $cambios];
    }

    private function calculateKPIs($institutoId, $year, $semester)
    {
        $totalDocentes = Docente::deInstituto($institutoId)->count();
        $incompletosCount = Docente::deInstituto($institutoId)
            ->where(fn($q) => $q->whereNull('email')->orWhereNull('telefono')->orWhere('email', '')->orWhere('telefono', ''))
            ->count();
        
        $comisionesCreadas = Comision::where('anio', $year)->where('cuatrimestre', $semester)
            ->whereHas('materia.planes.carrera', fn($q) => $q->where('instituto_id', $institutoId))
            ->count();

        $materiasDelPeriodo = Materia::where('estado', true)->where('cuatrimestre', $semester)
            ->whereHas('planes', fn($q) => $q->whereNull('anio_fin')->whereHas('carrera', fn($c) => $c->where('instituto_id', $institutoId)))
            ->count();

        return [
            'registros_incompletos' => [
                'valor' => $incompletosCount,
                'total' => $totalDocentes,
                'porcentaje' => $totalDocentes > 0 ? round(($incompletosCount / $totalDocentes) * 100, 1) : 0,
            ],
            'comisiones' => [
                'creadas' => $comisionesCreadas,
                'pendientes' => max(0, $materiasDelPeriodo - $comisionesCreadas),
                'total_materias' => $materiasDelPeriodo,
            ],
            'docentes_activos' => [
                'valor' => Docente::where('es_activo', true)->deInstituto($institutoId)->count(),
                'total' => $totalDocentes,
            ],
        ];
    }

    private function getMateriasCompartidas($institutoId)
    {
        $carreraIds = Carrera::where('instituto_id', $institutoId)->pluck('id');

        $materias = Materia::query()
            ->whereHas('planes', fn($q) => $q->whereIn('carrera_id', $carreraIds))
            ->with(['planes.carrera:id,nombre'])
            ->get()
            ->filter(fn($m) => $m->planes->pluck('carrera_id')->unique()->count() >= 2)
            ->map(fn($m) => [
                'id' => $m->id,
                'nombre' => $m->nombre,
                'codigo' => $m->codigo,
                'carreras' => $m->planes->pluck('carrera.nombre')->unique()->values(),
                'total_carreras' => $m->planes->pluck('carrera_id')->unique()->count(),
            ])->values();

        return ['total' => $materias->count(), 'materias' => $materias];
    }

    private function getDocentesMultiCarrera($institutoId)
    {
        $carreraIds = Carrera::where('instituto_id', $institutoId)->pluck('id');

        $docentes = Docente::query()
            ->deInstituto($institutoId)
            ->whereHas('comisiones.materia.planes', fn($q) => $q->whereIn('carrera_id', $carreraIds))
            ->with(['comisiones.materia.planes.carrera'])
            ->get()
            ->filter(function($docente) use ($carreraIds) {
                return $docente->comisiones->flatMap(fn($c) => $c->materia->planes->pluck('carrera_id'))->unique()->intersect($carreraIds)->count() >= 2;
            })
            ->map(fn($doc) => [
                'id' => $doc->id,
                'nombre_completo' => "{$doc->apellido}, {$doc->nombre}",
                'legajo' => $doc->legajo,
                'email' => $doc->email,
                'total_carreras' => $doc->comisiones->flatMap(fn($c) => $c->materia->planes->pluck('carrera_id'))->unique()->count(),
            ])->values();

        return ['total' => $docentes->count(), 'docentes' => $docentes];
    }

    private function getConflictosHorarios($institutoId, $year, $semester)
    {
        $conflictos = Dicta::query()
            ->whereHas('comision', fn($q) => $q->where('anio', $year)->where('cuatrimestre', $semester)->whereHas('materia.planes.carrera', fn($c) => $c->where('instituto_id', $institutoId)))
            ->with(['docente:id,nombre,apellido', 'comision.materia:id,nombre'])
            ->get()
            ->groupBy('docente_id')
            ->filter(fn($dictas) => $dictas->count() >= 2)
            ->map(fn($dictas) => [
                'docente' => "{$dictas->first()->docente->apellido}, {$dictas->first()->docente->nombre}",
                'comisiones' => $dictas->map(fn($d) => [
                    'nombre' => $d->comision->nombre,
                    'materia' => $d->comision->materia->nombre,
                    'turno' => $d->comision->turno,
                ])->values(),
            ])->values();

        return ['total' => $conflictos->count(), 'conflictos' => $conflictos];
    }

    private function getVisionGeneral($institutoId)
    {
        $compartidas = $this->getMateriasCompartidas($institutoId);
        return [
            'topMaterias' => collect($compartidas['materias'])->sortByDesc('total_carreras')->take(5)->values()
        ];
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cargo;
use App\Models\Docente;
use Inertia\Inertia;

class CargoController extends Controller
{
    public function show(Cargo $cargo)
    {
        $docente = $cargo->docente;
        $user = auth()->user();

        return Inertia::render('Docentes/Cargos/Show', [
            'cargo' => $cargo,
            'docente' => $docente,
            'can' => [
                'view' => $user->can('consultar_docente'),
                'update' => $user->can('update', $docente),
                'delete' => $user->can('delete', $docente),
            ],
        ]);        
    }

    public function store(Request $request)
    {
        $docenteReference = $request->validate([
            'docente_id' => 'required|exists:docentes,id',
        ]);
        $docente = Docente::findOrFail($docenteReference['docente_id']);
        $this->authorize('manageCargos', $docente);

        $validated = $request->validate([
            'cargo' => 'required|string|max:255',
            'dedicacion_id' => 'required|exists:dedicaciones,id',
            'docente_id' => 'required|exists:docentes,id',
            'comision_id' => 'nullable|integer|exists:comisiones,id',
        ]);

        $cargo = $docente->cargos()->create([
            'nombre' => $validated['cargo'],
            'dedicacion_id' => $validated['dedicacion_id'],
            'nro_materias_asig' => 0,
            'sum_horas_frente_aula' => 0,
        ]);

        if ($validated['comision_id'] ?? null) {
            return redirect()
                ->route('dictas.create', [
                    'comision_id' => $validated['comision_id'],
                    'docente_id' => $docente->id,
                ])
                ->with('success', 'Cargo agregado exitosamente. Ya podés completar la asignación.');
        }

        return redirect()
            ->route('docentes.show', $docente->id)
            ->with('success', 'Cargo agregado exitosamente');
    }


    public function destroy(Cargo $cargo)
    {
        $docente = $cargo->docente;
        $this->authorize('delete', $docente);
        $cargo->delete();
        return redirect()
            ->route('docentes.index')
            ->with('success', '¡El Cargo ha sido eliminado exitosamente!');    
    }
}

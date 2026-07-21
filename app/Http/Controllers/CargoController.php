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
                'view' => $user->can('consultar_docente', $docente),
                'update' => $user->can('modificar_docente', $docente),
                'delete' => $user->can('modificar_docente', $docente),
            ],
        ]);        
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cargo' => 'required|string|max:255',
            'dedicacion_id' => 'required|exists:dedicaciones,id',
            'docente_id' => 'required|exists:docentes,id',
        ]);

        $docente = Docente::findOrFail($validated['docente_id']);
        $this->authorize('update', $docente);

        $cargo = $docente->cargos()->create([
            'nombre' => $validated['cargo'],
            'dedicacion_id' => $validated['dedicacion_id'],
            'nro_materias_asig' => 0,
            'sum_horas_frente_aula' => 0,
        ]);

        return redirect()
            ->route('docentes.show', $docente->id)
            ->with('success', 'Cargo agregado exitosamente');
    }


    public function destroy(Cargo $cargo)
    {
        $docente = $cargo->docente;
        $this->authorize('update', $docente);
        $cargo->delete();
        return redirect()
            ->route('docentes.index')
            ->with('success', '¡El Cargo ha sido eliminado exitosamente!');    
    }
}

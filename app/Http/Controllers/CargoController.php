<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Docente;

class CargoController extends Controller
{
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
}

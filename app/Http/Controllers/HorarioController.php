<?php

namespace App\Http\Controllers;

use App\Models\Horario;
use App\Models\Comision;
use Illuminate\Http\Request;

class HorarioController extends Controller
{
    public function index($comisionId)
    {
        
        $horarios = Horario::where('comision_id', $comisionId)->get();
        return response()->json($horarios);
    }

    public function store(Request $request, $comisionId)
    {
        $comision = Comision::findOrFail($comisionId);
        $this->authorize('update', $comision);
        $validated = $request->validate([
            'dia_semana'  => 'required|in:lunes,martes,miercoles,jueves,viernes,sabado',
            'hora_inicio' => 'required|regex:/^\d{2}:\d{2}$/',
            'hora_fin'    => 'required|regex:/^\d{2}:\d{2}$/',
            'aula'        => 'nullable|string|max:50',
        ], [
            'dia_semana.required'  => 'El día es obligatorio',
            'dia_semana.in'        => 'El día no es válido',
            'hora_inicio.required' => 'La hora de inicio es obligatoria',
            'hora_inicio.date_format' => 'Formato de hora inválido',
            'hora_fin.required'    => 'La hora de fin es obligatoria',
            'hora_fin.after'       => 'La hora de fin debe ser después de la hora de inicio',
        ]);

        Horario::create([
            ...$validated,
            'comision_id' => $comision->id,
        ]);

        return redirect()->route('comisiones.show', $comision->id)
            ->with('success', 'Horario agregado correctamente.');
    }

    public function destroy($id)
    {
        $horario = Horario::findOrFail($id);
        $comisionId = $horario->comision_id;
        $this->authorize('update', $comision);
        $horario->delete();

        return redirect()->route('comisiones.show', $comisionId)
            ->with('success', 'Horario eliminado correctamente.');
    }
}
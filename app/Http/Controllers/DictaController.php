<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comision;
use App\Models\FuncionAulica;
use Inertia\Inertia;
use App\Models\Dicta;
use App\Models\Docente;
use App\Services\NormativaAsignacion;
use Illuminate\Validation\ValidationException;
use DB;
use Exception;


class DictaController extends Controller
{
    public function create(Request $request)
    {
        // Validar que se pase la comisión
        $request->validate([
            'comision_id' => 'required|exists:comisiones,id',
        ]);

        // Obtener la comisión
        $comision = Comision::with('materia')->findOrFail($request->comision_id);
        $this->authorize('update', $comision);

        $docente = \App\Models\Docente::with('cargos.dedicacion')->findOrFail($request->docente_id);

        if ($docente->cargos->isEmpty()) {
            if ($request->user()->can('manageCargos', $docente)) {
                return redirect()
                    ->route('docentes.cargo.create', [
                        'docente' => $docente,
                        'comision_id' => $comision->id,
                    ])
                    ->with('error', 'El docente no tiene cargos registrados. Agregá uno para poder asignarlo a la comisión.');
            }

            return redirect()
                ->route('comisiones.show', $comision)
                ->with('error', 'El docente no tiene cargos registrados y no tenés permiso para agregarlos.');
        }

        $funcionesAulicas = FuncionAulica::all();

        return Inertia::render('Comisiones/Dictas/Create', [
            'comision' => $comision,
            'periodo' => $comision->periodoAcademico(),
            'docente' => $docente,
            'funcionesAulicas' => $funcionesAulicas,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'comision_id' => 'required|exists:comisiones,id',
                'docente_id' => 'required|exists:docentes,id',
                'cargo_id' => 'required|exists:cargos,id',
                'horas_frente_aula' => 'required|integer|min:0',
                'funcion_aulica_id' => 'nullable|exists:funciones_aulicas,id',
            ], [
                'comision_id.required' => 'La comisión es obligatoria',
                'docente_id.required' => 'El docente es obligatorio',
                'cargo_id.required' => 'El cargo es obligatorio',
                'horas_frente_aula.required' => 'Debe ingresar las horas frente al aula',
            ]);

            $comision = Comision::with('materia')->findOrFail($validated['comision_id']);
            $periodo = $comision->periodoAcademico();
            $validated['modalidad_presencia'] = $comision->modalidad;
            $validated['ano_inicio'] = $periodo['inicio'];
            $validated['año_fin'] = $periodo['fin'];

            // Evitar duplicados
            $exists = Dicta::where('comision_id', $validated['comision_id'])
                ->where('docente_id', $validated['docente_id'])
                ->where('cargo_id', $validated['cargo_id'])
                ->exists();

            if ($exists) {
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'Este docente ya está vinculado a la comisión con ese cargo.');
            }

            // Crear el registro
            $dicta = Dicta::create($validated);

            // Aplicar normativa (puede lanzar ValidationException)
            NormativaAsignacion::cargarHorasFrenteAlAula($dicta);

            // Si todo sale bien, redirigir al show
            return redirect()
                ->route('comisiones.show', $validated['comision_id'])
                ->with('success', 'Docente vinculado exitosamente a la comisión.');

        } catch (ValidationException $e) {
            // Si hay errores de validación de normativa o de request
            return redirect()
                ->route('comisiones.show', $request->comision_id)
                ->with('error', 'Error al asignar el docente: ' . collect($e->errors())->flatten()->first())
                ->withInput();

        } catch (Exception $e) {
            // Cualquier otro error inesperado
            return redirect()
                ->route('dictas.create', ['comision_id' => $request->comision_id, 'docente_id' => $request->docente_id])
                ->with('error', 'Ocurrió un error al intentar asignar el docente: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function edit(Dicta $dicta)
    {

        $dicta->load(['comision.materia', 'docente']);
        $this->authorize('update', $dicta->comision);
        $cargos = $dicta->docente->cargos;
        
        $funcionesAulicas = FuncionAulica::all();

        return Inertia::render('Comisiones/Dictas/Edit', [
            'dicta' => $dicta,
            'periodo' => $dicta->comision->periodoAcademico(),
            'cargos' => $cargos,
            'funcionesAulicas' => $funcionesAulicas,
        ]);
    }

    public function update(Request $request, Dicta $dicta)
    {
        // 1. CLAVE: Capturar los datos originales antes de cualquier cambio en la base de datos
        // Esto incluye cargo_id, horas_frente_aula, y funcion_aulica_id.
        $originalData = $dicta->only(['cargo_id', 'horas_frente_aula', 'funcion_aulica_id', 'docente_id', 'comision_id']);

        try {
            // 2. Validación de los datos del Request
            $validated = $request->validate([
                // Aseguramos que no se intenten cambiar las claves primarias aquí si no es necesario
                'comision_id' => 'required|exists:comisiones,id',
                'docente_id' => 'required|exists:docentes,id',
                'cargo_id' => 'required|exists:cargos,id',
                'horas_frente_aula' => 'required|integer|min:0',
                'funcion_aulica_id' => 'nullable|exists:funciones_aulicas,id',
            ], [
                // ... Mensajes de error (abreviado) ...
                'comision_id.required' => 'La comisión es obligatoria',
                'docente_id.required' => 'El docente es obligatorio',
                'cargo_id.required' => 'El cargo es obligatorio',
                'horas_frente_aula.required' => 'Debe ingresar las horas frente al aula',
            ]);

            $comision = Comision::with('materia')->findOrFail($validated['comision_id']);
            $periodo = $comision->periodoAcademico();
            $validated['modalidad_presencia'] = $comision->modalidad;
            $validated['ano_inicio'] = $periodo['inicio'];
            $validated['año_fin'] = $periodo['fin'];

            // 3. Ejecutar la actualización dentro de una transacción
            DB::transaction(function () use ($dicta, $validated, $originalData) {
                
                // Actualizar la dicta primero con los nuevos datos
                $dicta->update($validated);

                // 4. Aplicar la lógica de Normativa: Restar impacto antiguo y sumar impacto nuevo
                NormativaAsignacion::updateDicta($dicta, $originalData);
            });

            // 5. Redirección exitosa
            return redirect()
                ->route('comisiones.show', $validated['comision_id'])
                ->with('success', 'Relación entre docente y comisión actualizada correctamente.');

        } catch (ValidationException $e) {
            // Errores de validación de Laravel (incluyendo los lanzados por NormativaAsignacion::aplicarImpactoHorario)
            return redirect()
                ->route('dictas.edit', $dicta)
                ->withErrors($e->errors())
                ->withInput();

        } catch (Exception $e) {
            // Cualquier otro error inesperado
            return redirect()
                ->route('dictas.edit', $dicta)
                ->with('error', 'Ocurrió un error al intentar actualizar la asignación: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy($id)
    {
        $dicta = \App\Models\Dicta::findOrFail($id);
        $comisionId = $dicta->comision_id;
        $this->authorize('delete', $dicta->comision);
        try {
            DB::transaction(function () use ($dicta) {
                $docente = $dicta->docente;
                $cargo = $dicta->cargo;

                // 2. Eliminar el registro de Dicta
                $dicta->delete();

                // 3. Recalcular los agregados.
                // La query de recalcularCargo ya no encontrará esta Dicta, dando el total correcto.
                NormativaAsignacion::recalcularCargo($docente, $cargo);
                NormativaAsignacion::recalcularCargaHorariaDocente($docente);

            });

            return redirect()->back()
                ->with('success', 'Vinculación del docente eliminada exitosamente.');
        } catch (Exception $e) {
            // Manejar cualquier fallo de la transacción
            return redirect()->back()
                ->with('error', 'Error al eliminar la asignación: ' . $e->getMessage());
        }
    }


}

<?php

namespace App\Services;

use App\Models\Dicta;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use DB;

class NormativaAsignacion
{
    /**
     * Valida la compatibilidad entre la Función Áulica y el Cargo.
     * Si no es compatible, lanza una excepción de validación.
     *
     * @param Dicta $dicta El modelo Dicta con sus relaciones cargadas.
     * @throws ValidationException
     * @return void
     */
    private static function validarCompatibilidad(Dicta $dicta): void
    {
        // Aseguramos que las relaciones estén cargadas
        $dicta->loadMissing(['funcionAulica', 'cargo']);

        $funcion_aulica = strtolower(trim($dicta->funcionAulica->nombre));
        $cargo = $dicta->cargo;
        
        
        $esTeorica = $funcion_aulica === 'teorica' ||
        $funcion_aulica === 'teórico' ||
        $funcion_aulica === 'responsable de cátedra' ||
        $funcion_aulica === 'auxiliar de cátedra';

        $esPractica = $funcion_aulica === 'practica' || $funcion_aulica === 'práctico';
        $esTeoricaPractica = $funcion_aulica === 'teorica/practica';

        $esCargoSuperior = Str::contains($cargo->nombre, ['Titular', 'Adjunto', 'Asociado']);
        $esCargoPractico = Str::contains($cargo->nombre, ['Jefe de Trabajos Practicos', 'Ayudante de Primera']);
       
        if (
            ($esTeorica && $esCargoSuperior) ||
            ($esPractica && $esCargoPractico) ||
            $esTeoricaPractica
        ) {
            return; // OK, compatible
        } else {
            throw ValidationException::withMessages([
                'funcion_aulica' => 'La función áulica no es compatible con el cargo del docente.',
            ]);
        }
    }

    /**
     * Recalcula la carga horaria y el número de materias asignadas
     * para un CARGO específico de un DOCENTE, consultando directamente la tabla Dicta.
     * * Implementa la lógica: SUM de horas y COUNT DISTINCT de materias.
     *
     * @param object $docente El modelo Docente.
     * @param object $cargo El modelo Cargo que se debe recalcular.
     * @return void
     */
    public static function recalcularCargo($docente, $cargo): void
    {
        // 1. SUMA de horas frente al aula
        $totalHoras = Dicta::join('comisiones', 'dictas.comision_id', '=', 'comisiones.id')
            ->where('dictas.docente_id', $docente->id)
            ->where('dictas.cargo_id', $cargo->id)
            ->where('comisiones.estado', true)
            ->sum('dictas.horas_frente_aula');

        // 2. COUNT DISTINCT de materias asignadas
        $totalMaterias = Dicta::join('comisiones', 'dictas.comision_id', '=', 'comisiones.id')
            ->where('dictas.docente_id', $docente->id)
            ->where('dictas.cargo_id', $cargo->id)
            ->where('comisiones.estado', true)
            ->distinct('comisiones.id_materia')
            ->count('comisiones.id_materia');
            
        // 3. Aplicar y guardar
        $cargo->sum_horas_frente_aula = $totalHoras;
        $cargo->nro_materias_asig = $totalMaterias;
        $cargo->save();
    }
    
    /**
     * Recalcula y guarda la carga horaria total del docente (docente.carga_horaria)
     * sumando todas las horas de Dictas.
     *
     * @param object $docente El modelo Docente.
     * @return void
     */
    public static function recalcularCargaHorariaDocente($docente): void
    {
        $totalCargaHoraria = Dicta::join('comisiones', 'dictas.comision_id', '=', 'comisiones.id')
            ->where('dictas.docente_id', $docente->id)
            ->where('comisiones.estado', true)
            ->sum('dictas.horas_frente_aula');
        
        $docente->carga_horaria = $totalCargaHoraria;
        $docente->save();
    }

    // ----------------------------------------------------------------------
    // FLUJOS DE ALTO NIVEL (CREATE, UPDATE, DELETE)
    // ----------------------------------------------------------------------

    /**
     * Asigna horas al docente (flujo de creación).
     *
     * @param Dicta $dicta El modelo Dicta recién guardado.
     * @return void
     */
    public static function cargarHorasFrenteAlAula(Dicta $dicta): void
    {
        // 1. Validar si la Dicta es válida
        self::validarCompatibilidad($dicta);
        
        // 2. Recalcular los agregados
        self::recalcularCargo($dicta->docente, $dicta->cargo);
        self::recalcularCargaHorariaDocente($dicta->docente);
    }

    /**
     * Elimina horas del docente (flujo de eliminación).
     * Se debe llamar con el modelo Dicta justo antes de la eliminación del registro.
     *
     * @param Dicta $dicta El modelo Dicta a eliminar.
     * @return void
     */
    public static function eliminarHorasFrenteAlAula(Dicta $dicta): void
    {
        // 1. Validar (necesario por si la combinación era inválida al momento de la eliminación)
        self::validarCompatibilidad($dicta);
        
        // 2. Recalcular los agregados (la Dicta será excluida por la query de recalculo)
        self::recalcularCargo($dicta->docente, $dicta->cargo);
        self::recalcularCargaHorariaDocente($dicta->docente);
    }

    /**
     * Gestiona la actualización de una Dicta.
     *
     * @param Dicta $dicta La Dicta con los datos nuevos (ya actualizada).
     * @param array $originalData Datos de la Dicta antes de la actualización (para identificar el cargo anterior).
     * @return void
     */
    public static function updateDicta(Dicta $dicta, array $originalData): void
    {
        $dicta->loadMissing(['docente', 'cargo']);
        $docente = $dicta->docente;
        
        // 1. VALIDAR COMPATIBILIDAD CARGO-FUNCIÓN para la Dicta recién actualizada
        self::validarCompatibilidad($dicta);

        // 2. Recalcular el Cargo ANTERIOR
        // Si el cargo cambió, debemos recalcular el cargo que perdió esta Dicta.
        if ($originalData['cargo_id'] !== $dicta->cargo_id) {
            $cargoAnterior = $docente->cargos()->find($originalData['cargo_id']);
            if ($cargoAnterior) {
                self::recalcularCargo($docente, $cargoAnterior);
            }
        }

        // 3. Recalcular el Cargo NUEVO 
        // Siempre se recalcula el nuevo cargo para incluir las horas actualizadas.
        self::recalcularCargo($docente, $dicta->cargo);

        // 4. Recalcular la Carga Horaria total del Docente
        self::recalcularCargaHorariaDocente($docente);
    }
}
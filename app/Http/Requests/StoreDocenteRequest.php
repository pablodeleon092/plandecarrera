<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDocenteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Por ahora, permitimos que cualquiera autenticado realice la solicitud.
        // Aquí podrías añadir lógica de autorización más compleja si es necesario.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Obtenemos el docente de la ruta si estamos en 'update'.
        // Si estamos en 'store', $this->route('docente') será null.
        $docente = $this->route('docente');
        $docenteId = $docente ? $docente->id : null;
        $legajoRules = [
            'required',
            'integer',
            Rule::unique('docentes', 'legajo')->ignore($docenteId),
        ];

        if ($docente && $this->user()?->cannot('editLegajo', $docente)) {
            $legajoRules[] = function (string $attribute, mixed $value, Closure $fail) use ($docente): void {
                if ((int) $value !== (int) $docente->legajo) {
                    $fail('No tenés permiso para modificar el legajo del docente.');
                }
            };
        }

        return [
            // Usamos Rule::unique para manejar dinámicamente la creación y actualización.
            // ignorará el ID del docente actual al validar la unicidad.
            'legajo' => $legajoRules,
            'nombre' => ['required', 'string', 'max:255'],
            'apellido' => ['required', 'string', 'max:255'],
            'modalidad_desempeño' => ['required', Rule::in(['Investigador', 'Desarrollo'])],
            'carga_horaria' => ['required', 'integer'],
            'es_activo' => ['boolean'],
            'telefono' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('docentes', 'email')->ignore($docenteId)],
        ];
    }
}

<?php
namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use App\Models\{Docente, Cargo, Instituto, Carrera, Materia, Comision, Dicta, FuncionAulica, Plan, Dedicaciones};

class QueryFilter
{
    public function apply(Builder $query, array $filters): Builder
    {
        foreach ($filters as $filter) {
            $field = $filter['field'] ?? null;
            $operator = $filter['operator'] ?? null;
            $value = $filter['value'] ?? null;

            if (!$field || (empty($value) && $value !== '0')) continue;

            $this->applyFilter($query, $field, $operator, $value);
        }

        return $query;
    }

    protected function applyFilter($query, $field, $operator, $value)
    {

        if (str_contains($field, '.')) {
                // Separamos la primera relación del resto (ej: 'cargos' y 'dedicaciones.nombre')
            $parts = explode('.', $field);
            $relation = array_shift($parts); 
            $remainingField = implode('.', $parts);

            $query->whereHas($relation, function ($q) use ($remainingField, $operator, $value) {
                    // Llamada recursiva con el campo restante
                $this->applyFilter($q, $remainingField, $operator, $value);
            });
            return;
        }

        //querys que utilizen scopes definidos en el modelo
        $scopeName = 'scope' . str_replace('_', '', ucwords($field, '_'));
        $model = $query->getModel();

        if (method_exists($model, $scopeName)) {
            $query->{lcfirst(str_replace('scope', '', $scopeName))}($value);
            return;
        }

        $this->applyOperator($query, $field, $operator, $value);
    }

    protected function applyOperator($query, $field, $operator, $value)
    {
        
        switch ($operator) {
            case 'contains':
                $query->where($field, 'ILIKE', "%{$value}%"); // Uso ILIKE para PostgreSQL (insensible a mayúsculas)
                
                break;
            case 'equals':
                $query->where($field, '=', $value);
  
                break;
            case 'not_equals':
                $query->where($field, '!=', $value);
                break;
            case 'between':
                if (isset($value['min'], $value['max'])) {
                    $query->whereBetween($field, [$value['min'], $value['max']]);
                }
                break;
            // Otros operadores...
        }
    }
}
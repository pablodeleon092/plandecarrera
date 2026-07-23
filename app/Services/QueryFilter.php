<?php
namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use App\Models\{Docente, Cargo, Instituto, Carrera, Materia, Comision, Dicta, FuncionAulica, Plan, Dedicaciones};

class QueryFilter
{
    private const SPANISH_ACCENT_REPLACEMENTS = [
        'á' => 'a',
        'é' => 'e',
        'í' => 'i',
        'ó' => 'o',
        'ú' => 'u',
        'ü' => 'u',
        'ñ' => 'n',
        'Á' => 'a',
        'É' => 'e',
        'Í' => 'i',
        'Ó' => 'o',
        'Ú' => 'u',
        'Ü' => 'u',
        'Ñ' => 'n',
    ];

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

    public function applySearch(Builder $query, ?string $search, array $fields): Builder
    {
        $search = trim((string) $search);

        if ($search === '' || empty($fields)) {
            return $query;
        }

        $normalizedSearch = mb_strtolower(
            strtr($search, self::SPANISH_ACCENT_REPLACEMENTS),
            'UTF-8'
        );

        $query->where(function (Builder $searchQuery) use ($fields, $search, $normalizedSearch) {
            foreach ($fields as $field) {
                if ($field === 'legajo') {
                    $grammar = $searchQuery->getQuery()->getGrammar();
                    $wrappedField = $grammar->wrap($field);

                    $searchQuery->orWhereRaw(
                        "CAST({$wrappedField} AS TEXT) LIKE ?",
                        ["%{$normalizedSearch}%"]
                    );

                    continue;
                }

                $searchQuery->orWhere(function (Builder $fieldQuery) use ($field, $search) {
                    $this->applyContains($fieldQuery, $field, $search);
                });
            }
        });

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
                $this->applyContains($query, $field, $value);
                break;

            case 'equals':
                $query->where($field, '=', $value);
                break;

            case 'not_equals':
                $query->where($field, '!=', $value);
                break;

            // --- Casos solicitados ---
            case 'greater':
                $query->where($field, '>', $value);
                break;

            case 'less':
                $query->where($field, '<', $value);
                break;

            case 'between':
                if (isset($value['min'], $value['max'])) {
                    $query->whereBetween($field, [$value['min'], $value['max']]);
                }
                break;
        }
    }

    protected function applyContains($query, $field, $value): void
    {
        $grammar = $query->getQuery()->getGrammar();
        $normalizedField = 'lower('.$grammar->wrap($field).')';
        $bindings = [];

        foreach (self::SPANISH_ACCENT_REPLACEMENTS as $accented => $plain) {
            $normalizedField = "replace({$normalizedField}, ?, ?)";
            $bindings[] = $accented;
            $bindings[] = $plain;
        }

        $normalizedValue = mb_strtolower(
            strtr((string) $value, self::SPANISH_ACCENT_REPLACEMENTS),
            'UTF-8'
        );

        $bindings[] = "%{$normalizedValue}%";

        $query->whereRaw("{$normalizedField} LIKE ?", $bindings);
    }
}

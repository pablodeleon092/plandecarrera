export default function DynamicFilters ({ fields, filters, onChange }) {

    const OPERATORS = {
        string: [
            { value: 'contains', label: 'Contiene' },
            { value: 'equals', label: 'Es exactamente' },
            { value: 'not_equals', label: 'Es distinto de' }
        ],
        number: [
            { value: 'equals', label: 'Igual a' },
            { value: 'not_equals', label: 'Distinto de' },
            { value: 'greater', label: 'Mayor que' },
            { value: 'less', label: 'Menor que' },
            { value: 'between', label: 'Entre' }
        ],
        select: [
            { value: 'equals', label: 'Es' },
            { value: 'not_equals', label: 'No es' }
        ]
    };

    const addFilter = () => {
        const defaultField = fields[0];
        const newFilter = {
            id: Date.now(), // ID único para el key de React
            field: defaultField.key,
            operator: OPERATORS[defaultField.type][0].value,
            value: ''
        };
        onChange([...filters, newFilter]);
    };

    const removeFilter = (id) => {
        onChange(filters.filter(f => f.id !== id));
    };

    const updateFilter = (id, key, newValue) => {
        onChange(filters.map(filter => {
            if (filter.id === id) {
                const updated = { ...filter, [key]: newValue };
                
                // Si cambiamos de campo, resetear el operador y el valor
                if (key === 'field') {
                    const fieldConfig = fields.find(f => f.key === newValue);
                    updated.operator = OPERATORS[fieldConfig.type][0].value;
                    updated.value = fieldConfig.type === 'number' && updated.operator === 'between' ? { min: '', max: '' } : '';
                }

                // Si cambiamos a "between", inicializar el valor como objeto
                if (key === 'operator' && newValue === 'between') {
                    updated.value = { min: '', max: '' };
                } else if (key === 'operator' && filter.operator === 'between' && newValue !== 'between') {
                    updated.value = ''; // Resetear si dejamos de usar "between"
                }

                return updated;
            }
            return filter;
        }));
    };

    return (
        <div className="space-y-2">
            {filters.map((filter) => {
                const fieldConfig = fields.find(f => f.key === filter.field);
                const availableOperators = OPERATORS[fieldConfig.type] || [];

                return (
                    <div key={filter.id} className="flex items-center gap-2 border p-2 rounded bg-gray-50">
                        {/* 1. Selección del Campo */}
                        <select 
                            value={filter.field} 
                            onChange={(e) => updateFilter(filter.id, 'field', e.target.value)}
                            className="border p-1 rounded"
                        >
                            {fields.map(f => (
                                <option key={f.key} value={f.key}>{f.label}</option>
                            ))}
                        </select>

                        {/* 2. Selección del Operador */}
                        <select 
                            value={filter.operator} 
                            onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                            className="border p-1 rounded"
                        >
                            {availableOperators.map(op => (
                                <option key={op.value} value={op.value}>{op.label}</option>
                            ))}
                        </select>

                        {/* 3. Input del Valor (Dinámico) */}
                        <div className="flex-1">
                            {fieldConfig.type === 'select' ? (
                                <select 
                                    value={filter.value} 
                                    onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                                    className="border p-1 rounded w-full"
                                >
                                    <option value="">Seleccione...</option>
                                    {fieldConfig.options.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ) : filter.operator === 'between' ? (
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        placeholder="Min" 
                                        value={filter.value.min || ''} 
                                        onChange={(e) => updateFilter(filter.id, 'value', { ...filter.value, min: e.target.value })}
                                        className="border p-1 rounded w-full"
                                    />
                                    <span className="self-center">-</span>
                                    <input 
                                        type="number" 
                                        placeholder="Max" 
                                        value={filter.value.max || ''} 
                                        onChange={(e) => updateFilter(filter.id, 'value', { ...filter.value, max: e.target.value })}
                                        className="border p-1 rounded w-full"
                                    />
                                </div>
                            ) : (
                                <input 
                                    type={fieldConfig.type === 'number' ? 'number' : 'text'} 
                                    placeholder="Valor..." 
                                    value={filter.value} 
                                    onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                                    className="border p-1 rounded w-full"
                                />
                            )}
                        </div>

                        {/* 4. Botón de Eliminar */}
                        <button 
                            onClick={() => removeFilter(filter.id)}
                            className="text-red-600 hover:bg-red-100 p-1 rounded"
                            title="Quitar filtro"
                        >
                            ✕
                        </button>
                    </div>
                );
            })}

            <div className="flex justify-start">
                <button 
                    onClick={addFilter}
                    type="button"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 p-1"
                >
                    + Añadir filtro
                </button>
            </div>
        </div>
    );
};
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import DynamicFilters from '@/Components/Filters/DynamicFilters';
import { PrinterIcon } from '@heroicons/react/24/outline';
import BtnExportar from '@/Components/Buttons/BtnExportar'; // Ajusta la ruta

export default function GestionPersonal ({ institutos, carreras, dedicaciones, search = '' }) {
    // Definimos qué campos pueden ser filtrados
    const availableFields = [
        { key: 'cargos.nombre', label: 'Cargo', type: 'select', options: [
            { value: 'Titular', label: 'Titular' },
            { value: 'Asociado', label: 'Asociado' },
            { value: 'Adjunto', label: 'Adjunto' },
            { value: 'Jefe de Trabajos Practicos', label: 'Jefe de Trabajos Prácticos' },
            { value: 'Ayudante de Primera', label: 'Ayudante de Primera' },
        ]},
        { key: 'es_activo', label: 'Estado', type: 'select', 
          options: [{ value: '1', label: 'Activo' }, { value: '0', label: 'Inactivo' }] 
        },
        { key: 'de_instituto', label: 'Instituto', type: 'select', 
          options: institutos.map(inst => ({ value: inst.id.toString(), label: inst.nombre })) 
        },
        { key: 'cargos.dedicacion.id', label: 'Dedicaciones', type: 'select', 
          options: dedicaciones.map(d => ({ value: d.id.toString(), label: d.nombre }))
        },
        { key: 'de_Carrera', label: 'Carrera', type: 'select', 
          options: carreras.map(c => ({ value: c.id.toString(), label: c.nombre }))
        },
        { key: 'carga_horaria', label: 'Carga Horaria', type: 'number' },
        { 
            key: 'modalidad_desempeño', 
            label: 'Modalidad', 
            type: 'select', 
            options: [
                { value: 'Investigador', label: 'Investigador' },
                { value: 'Desarrollo', label: 'Desarrollo' }
            ]
        } 
    ];

    const [activeFilters, setActiveFilters] = useState([]);

    const handleApplyFilters = () => {
        const params = new URLSearchParams();

        if (search) {
            params.set('search', search);
        }

        activeFilters.forEach((filter, index) => {
            params.append(`filters[${index}][field]`, filter.field);
            params.append(`filters[${index}][operator]`, filter.operator);

            if (typeof filter.value === 'object' && filter.value !== null) {
                params.append(`filters[${index}][value][min]`, filter.value.min || '');
                params.append(`filters[${index}][value][max]`, filter.value.max || '');
            } else {
                params.append(`filters[${index}][value]`, filter.value || '');
            }
        });

        const query = params.toString();
        const url = query
            ? `${route('docentes.index')}?${query}`
            : route('docentes.index');

        router.get(url, {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };


    
    return (
            <div className="p-4 bg-white border rounded shadow-sm">
            <div className="relative">
                <DynamicFilters 
                    fields={availableFields} 
                    filters={activeFilters} 
                    onChange={setActiveFilters} 
                />
                {/* BOTÓN APLICAR: Posicionado a la derecha del área de filtros */}
                <div className="flex justify-end mt-4 border-t pt-4">
                    <button 
                        type="button"
                        onClick={handleApplyFilters}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm"
                    >
                        Aplicar Filtros
                    </button>
                </div>
                    <BtnExportar tipo="docentes" filters={activeFilters} />
            </div>
        </div>
    );
};

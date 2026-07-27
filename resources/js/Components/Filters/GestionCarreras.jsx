import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import DynamicFilters from '@/Components/Filters/DynamicFilters';
import { PrinterIcon } from '@heroicons/react/24/outline';
import BtnExportar from '@/Components/Buttons/BtnExportar'; // Ajusta la ruta

export default function GestionCarreras ({ institutos, search = '' }) {
    // Definimos qué campos pueden ser filtrados
    const availableFields = [
        { key: 'estado', label: 'Estado', type: 'select', 
          options: [{ value: '1', label: 'Activo' }, { value: '0', label: 'Inactivo' }] 
        },
        { key: 'modalidad', label: 'Modalidad', type: 'select', 
          options: [{ value: 'presencial', label: 'Presencial' }, 
                    { value: 'virtual', label: 'Virtual' }, 
                    { value: 'mixta', label: 'Mixta' }] 
        },                   
        { key: 'instituto_id', label: 'Instituto', type: 'select', 
          options: institutos.map(i => ({ value: i.id.toString(), label: i.nombre }))
        },
        { key: 'sede', label: 'Sede', type: 'select', 
          options: [{ value: 'Ushuaia', label: 'Ushuaia' }, 
                    { value: 'Rio Grande', label: 'Ushuaia' }, 
                    { value: 'Ushuaia/Rio Grande', label: 'Ushuaia/Rio Grande' }] 
        },      
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
            ? `${route('carreras.index')}?${query}`
            : route('carreras.index');

        router.get(url, {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };


    const handleExportarPdf = () => {
        // 1. Creamos el objeto de búsqueda de la URL
        const params = new URLSearchParams();

        activeFilters.forEach((filter, index) => {
            if (typeof filter.value === 'object' && filter.value !== null) {
                params.append(`filters[${index}][field]`, filter.field);
                params.append(`filters[${index}][operator]`, filter.operator);
                params.append(`filters[${index}][value][min]`, filter.value.min || '');
                params.append(`filters[${index}][value][max]`, filter.value.max || '');
            } else {
                params.append(`filters[${index}][field]`, filter.field);
                params.append(`filters[${index}][operator]`, filter.operator);
                params.append(`filters[${index}][value]`, filter.value || '');
            }
        });

        // 3. Construimos la URL final
        const baseUrl = route('carreras.exportar');
        const fullUrl = `${baseUrl}?${params.toString()}`;

        // 4. Redireccionamos (esto disparará la descarga en el navegador)
        window.location.href = fullUrl;
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
                    <BtnExportar tipo="comisiones" filters={activeFilters} />
            </div>
        </div>
    );
};

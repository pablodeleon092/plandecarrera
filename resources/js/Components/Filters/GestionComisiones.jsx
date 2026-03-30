import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import DynamicFilters from '@/Components/Filters/DynamicFilters';
import { PrinterIcon } from '@heroicons/react/24/outline';

export default function gestionComisiones ({institutos, carreras}) {
    // Definimos qué campos pueden ser filtrados
    const availableFields = [
        { key: 'nombre', label: 'Nombre', type: 'string' },
        { key: 'codigo', label: 'Codigo', type: 'string' },
        { key: 'materia.nombre', label: 'Materia', type: 'string' },
        { key: 'estado', label: 'Estado', type: 'select', 
          options: [{ value: '1', label: 'Activo' }, { value: '0', label: 'Inactivo' }] 
        },
        { key: 'turno', label: 'Turno', type: 'select', 
          options: [{ value: 'Tarde', label: 'Tarde' }, { value: 'Mañana', label: 'Mañana' }] 
        },
        { key: 'modalidad', label: 'Modalidad', type: 'select', 
          options: [{ value: 'presencial', label: 'Presencial' }, 
                    { value: 'virtual', label: 'Virtual' }, 
                    { value: 'mixta', label: 'Mixta' }] 
        },                   
        { 
            key: 'regimen', 
            label: 'Regimen', 
            type: 'select', 
            options: [
                { value: 'anual', label: 'Anual' },
                { value: 'Cuatrimestral', label: 'cuatrimestal' }
            ]
        },
        { key: 'anio', label: 'Año', type: 'number' },
        { key: 'horas_teoricas', label: 'Horas Teoricas', type: 'number' },
        { key: 'horas_practicas', label: 'Horas Practicas', type: 'number' },
        { key: 'horas_totales', label: 'Horas Totales', type: 'number' },
        { 
                key: 'horarios.dia_semana', 
                label: 'Día de la Semana', 
                type: 'select', 
                options: [
                    { value: 'lunes', label: 'Lunes' },
                    { value: 'martes', label: 'Martes' },
                    { value: 'miercoles', label: 'Miércoles' },
                    { value: 'jueves', label: 'Jueves' },
                    { value: 'viernes', label: 'Viernes' },
                    { value: 'sabado', label: 'Sábado' }
                ] 
            },
            { 
                key: 'horarios.hora_inicio', 
                label: 'Hora Inicio', 
                type: 'time' 
            },
            { 
                key: 'horarios.hora_fin', 
                label: 'Hora Fin', 
                type: 'time' 
            },
            { 
                key: 'horarios.aula', 
                label: 'Aula', 
                type: 'string' 
            },
        { key: 'by_Instituto', label: 'Instituto', type: 'select', 
          options: institutos.map(i => ({ value: i.id.toString(), label: i.nombre }))
        },
        { key: 'by_Carrera', label: 'Carrera', type: 'select', 
          options: carreras.map(c => ({ value: c.id.toString(), label: c.nombre }))
        }
    ];

    const [activeFilters, setActiveFilters] = useState([]);

    const handleApplyFilters = (key, value) => {
        const newFilters = { ...activeFilters, [key]: value };
        router.get(route('comisiones.index'), 
        newFilters, {
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
        const baseUrl = route('docentes.exportar');
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
                        onClick={handleApplyFilters}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm"
                    >
                        Aplicar Filtros
                    </button>
                </div>
                        <button
                            onClick={handleExportarPdf}
                            className="inline-flex items-center px-4 py-2 bg-red-600 border 
                            border-transparent rounded-md font-semibold 
                            text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-900 focus:outline-none focus:border-red-900 focus:ring ring-red-300 disabled:opacity-25 transition ease-in-out duration-150"
                            title="Exportar lista filtrada a PDF"
                        >
                            <PrinterIcon className="w-4 h-4" />
                            Exportar PDF
                        </button>
            </div>
        </div>
    );
};
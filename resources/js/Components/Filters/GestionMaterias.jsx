import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import DynamicFilters from '@/Components/Filters/DynamicFilters';
import { PrinterIcon } from '@heroicons/react/24/outline';
import BtnExportar from '@/Components/Buttons/BtnExportar'; // Ajusta la ruta

export default function gestionMaterias ({institutos, carreras}) {
    // Definimos qué campos pueden ser filtrados
    const availableFields = [
        { key: 'nombre', label: 'Nombre', type: 'string' },
        { key: 'codigo', label: 'Codigo', type: 'string' },
        { key: 'estado', label: 'Estado', type: 'select', 
          options: [{ value: '1', label: 'Activo' }, { value: '0', label: 'Inactivo' }] 
        },
        { 
            key: 'regimen', 
            label: 'Regimen', 
            type: 'select', 
            options: [
                { value: 'anual', label: 'Anual' },
                { value: 'cuatrimestral', label: 'Cuatrimestal' }
            ]
        },
        { key: 'cuatrimestre', label: 'Cuatrimestre', type: 'number' },        
        { key: 'horas_semanales', label: 'Horas Semanales', type: 'number' },
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
        router.get(route('materias.index'), 
        newFilters, {
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
                        onClick={handleApplyFilters}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm"
                    >
                        Aplicar Filtros
                    </button>
                </div>
                <BtnExportar tipo="materias" filters={activeFilters} />
            </div>
        </div>
    );
};
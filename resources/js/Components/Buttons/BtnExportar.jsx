import React from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';

const BtnExportar = ({ tipo = "docentes", filters = [], className = "" }) => {
    
    const handleExportarPdf = () => {
        console.log("Tipo de reporte:", tipo); 
        console.log("Filtros a procesar:", filters);

        const params = new URLSearchParams();


        filters.forEach((filter, index) => {
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

        try {

            const baseUrl = route('exportar.pdf', { tipo: tipo });
            const fullUrl = `${baseUrl}?${params.toString()}`;
            
            console.log("URL Final generada:", fullUrl);
            
            // Redirección para descargar el PDF
            window.location.href = fullUrl;
        } catch (e) {
            console.error("Error en route():", e);

        }
    };

    return (
        <button
            type="button"
            onClick={handleExportarPdf}
            className={`inline-flex items-center px-4 py-2 bg-red-600 border 
            border-transparent rounded-md font-semibold 
            text-xs text-white uppercase tracking-widest hover:bg-red-700 
            active:bg-red-900 focus:outline-none focus:border-red-900 
            focus:ring ring-red-300 disabled:opacity-25 transition 
            ease-in-out duration-150 ${className}`}
            title={`Exportar ${tipo} a PDF`}
        >
            <PrinterIcon className="w-4 h-4 mr-2" />
            Exportar {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
        </button>
    );
};

export default BtnExportar;
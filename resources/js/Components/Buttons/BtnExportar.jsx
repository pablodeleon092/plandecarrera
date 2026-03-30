import React from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';

const BtnExportar = ({ tipo = "docentes", filters = [], className = "" }) => {
    
    const handleExportarPdf = () => {
        // 1. Verificamos qué tiene la variable 'tipo' en este instante
        console.log("Tipo de reporte:", tipo); 
        
        if (typeof tipo !== 'string') {
            console.error("ERROR: 'tipo' no es un string, es:", typeof tipo);
        }

        const params = new URLSearchParams();
        // ... tu lógica de filtros ...

        // 2. Intentamos generar la URL
        try {
            const baseUrl = route('exportar.pdf', { tipo: tipo });
            const fullUrl = `${baseUrl}?${params.toString()}`;
            console.log("URL Final:", fullUrl);
            window.location.href = fullUrl;
        } catch (e) {
            console.error("Error en route():", e);
            // Plan B: Si Ziggy sigue fallando, usa la ruta manual para probar
            // window.location.href = `/exportar/${tipo}?${params.toString()}`;
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
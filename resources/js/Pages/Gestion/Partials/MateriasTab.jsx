import React from 'react';

export default function MateriasTab({ materias = [] }) {
    
    // 1. Estado vacío: Si no hay datos, mostramos mensaje amigable
    if (!materias || materias.length === 0) {
        return (
            <div className="p-8 text-center bg-white border border-gray-200 rounded-lg">
                <p className="text-gray-500">
                    No se detectaron materias compartidas entre distintas carreras.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Encabezado con contador */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                    Materias Transversales
                </h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    {materias.length} Materias compartidas
                </span>
            </div>

            {/* Tabla */}
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Materia
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Código
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Compartida entre (Carreras)
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {materias.map((materia) => (
                            <tr key={materia.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {materia.nombre}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded bg-gray-100 text-gray-600">
                                        {materia.codigo}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                        {/* Iteramos sobre los nombres de las carreras */}
                                        {materia.carreras_nombres && materia.carreras_nombres.map((carrera) => (
                                            <span 
                                                key={carrera}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                            >
                                                {carrera}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
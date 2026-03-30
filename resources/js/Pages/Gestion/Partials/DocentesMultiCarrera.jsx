import React from 'react';

export default function DocentesMultiCarrera({ docentes }) {
    // Esto te dirá en la consola del navegador si llegaron los profes
    console.log("Datos recibidos en la tabla:", docentes);

    if (!docentes || docentes.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                No se encontraron docentes con múltiples asignaciones para mostrar.
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Legajo</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Carreras</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {docentes.map((docente) => (
                        <tr key={docente.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                {docente.apellido}, {docente.nombre}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {docente.legajo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="px-2 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700">
                                    {docente.total_carreras}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
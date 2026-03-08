import React from 'react';

export default function ComisionesTab({ superposiciones = [] }) {
    

    if (superposiciones.length === 0) {
        return (
            <div className="p-12 text-center border-2 border-dashed border-green-200 bg-green-50 rounded-xl">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <h3 className="text-green-800 font-bold text-lg">Todo en orden</h3>
                <p className="text-green-600 mt-2">
                    No se detectaron docentes con superposición de horarios en el mismo cuatrimestre.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/*  ENCABEZADO   */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Alertas de Superposición</h3>
                    <p className="text-sm text-gray-500">Docentes con múltiples comisiones en el mismo período.</p>
                </div>
                
                {/* Badge/Etiqueta roja de alerta */}
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold border border-red-200">
                    {superposiciones.length} Casos Detectados
                </span>
            </div>

            {/* 3. LA TABLA (DISEÑO MANUAL) */}
            <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                <table className="w-full text-sm text-left text-gray-500">
                    
                    {/* CABEZA DE LA TABLA  */}
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Docente</th>
                            <th className="px-6 py-4 text-center">Período</th>
                            <th className="px-6 py-4 text-center">Carga</th>
                            <th className="px-6 py-4 text-right">Acción</th>
                        </tr>
                    </thead>

                    {/* CUERPO DE LA TABLA (TBODY) */}
                    <tbody className="divide-y divide-gray-100">
                        {superposiciones.map((item, index) => (
                            <tr key={index} className="bg-white hover:bg-red-50 transition-colors">
                                
                                {/* Columna 1: Datos del Docente */}
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <div className="flex flex-col">
                                        <span className="text-base">{item.apellido}, {item.nombre}</span>
                                        <span className="text-xs text-gray-400">ID: {item.id}</span>
                                    </div>
                                </td>

                                {/* Columna 2: Año/Cuatrimestre (Centrado) */}
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                        {item.anio} - {item.cuatrimestre}º C
                                    </span>
                                </td>

                                {/* Columna 3: El Conflicto (Badge Naranja) */}
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-orange-600 font-bold text-lg">
                                            {item.cantidad_comisiones}
                                        </span>
                                        <span className="text-xs text-orange-500">comisiones</span>
                                    </div>
                                </td>

                                {/* Columna 4: Botón o Texto  discutir con los chicos si agregar horario*/}
                                <td className="px-6 py-4 text-right">
                                    <button className="text-indigo-600 hover:text-indigo-900 font-medium text-sm hover:underline">
                                        Ver Horarios(Discutir con los chicos esto) &rarr;
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* 4. PIE DE PÁGINA (Footer simple) */}
            <p className="mt-4 text-xs text-gray-400 text-center">
                * Se recomienda verificar manualmente si los horarios de estas comisiones coinciden en día y hora.
            </p>
        </div>
    );
}
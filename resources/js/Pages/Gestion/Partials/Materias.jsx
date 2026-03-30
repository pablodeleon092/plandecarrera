import React from 'react';
import PaginatorButtons from '@/Components/Buttons/PaginatorButtons';

export default function Materias({ materias }) {
    return (
        <>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                Materias Disponibles
            </h3>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Régimen</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuatrimestre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas Sem.</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisiones</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cant. Docentes</th>

                            {/* Columnas de Docentes por Cargo */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titular</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asociado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjunto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JTP</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asist</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {materias.data?.length > 0 ? (
                            materias.data.map((materia) => (
                                <tr key={materia.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{materia.codigo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{materia.nombre}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{materia.regimen}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{materia.cuatrimestre}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{materia.horas_semanales}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {materia.comisiones?.length > 0 ? (
                                            materia.comisiones.map(c => c.codigo).join(', ')
                                        ) : (
                                            'N/A'
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 text-center">

                                        {/* Cuenta el número de docentes únicos asignados a través de todas las comisiones */}
                                        {Array.from(new Set(materia.comisiones?.flatMap(c => c.dictas.map(d => d.docente.id)))).length}
                                    </td>
                                    {/* Renderiza los nombres de los docentes por cargo (o '-') */}
                                    <td className="px-6 py-4 text-sm text-gray-500">{materia.Titular || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{materia.Asociado || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{materia.Adjunto || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{materia.JTP || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{materia.Asist || '-'}</td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="12" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No hay materias disponibles para los criterios seleccionados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </>
    );
}
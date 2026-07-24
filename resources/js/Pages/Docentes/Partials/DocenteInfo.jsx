import React from 'react';
import { Link } from '@inertiajs/react';

export default function DocenteInfo({ docente, can = {} }) {
    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Columna Izquierda: Información Principal */}
            <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Información Principal</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Modalidad:</span>
                            <span className="font-semibold text-gray-900">{docente.modalidad_desempeño || 'No especificada'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Carga Horaria:</span>
                            <span className="font-semibold text-gray-900">{docente.carga_horaria} hs</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Contacto</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-semibold text-gray-900">{docente.email || 'No especificado'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Teléfono:</span>
                            <span className="font-semibold text-gray-900">{docente.telefono || 'No especificado'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Columna Derecha: Cargos */}
            <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase">Cargos Asignados</h3>
                        {docente.cargos && docente.cargos.length > 0 && can?.manageCargos && (
                            <Link
                                href={route('docentes.cargos.eliminar', docente.id)}
                                className="text-sm font-medium text-red-600 hover:underline"
                            >
                                Eliminar cargos
                            </Link>
                        )}
                    </div>
                    {docente.cargos && docente.cargos.length > 0 ? (
                        <ul className="space-y-2">
                            {docente.cargos.map(cargo => (
                                <li key={cargo.id} className="p-3 bg-white border border-gray-200 rounded-md shadow-sm">
                                    <p className="font-semibold text-gray-800">{cargo.nombre}</p>
                                    <p className="text-sm text-gray-500">Dedicación: {cargo.dedicacion ? cargo.dedicacion.nombre : 'N/A'}</p>
                                    <p className="text-sm text-gray-500">Horas: {cargo.sum_horas_frente_aula}</p>
                                    <p className="text-sm text-gray-500">Materias: {cargo.nro_materias_asig}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-500">Este docente no tiene cargos asignados.</p>
                            <Link
                                href={route('docentes.edit', docente.id)}
                                className="mt-2 inline-block text-sm text-blue-600 hover:underline font-medium"
                            >
                                Asignar un cargo
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
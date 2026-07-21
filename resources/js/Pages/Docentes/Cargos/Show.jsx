import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, cargo, docente }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Cargo {cargo.nombre} de {docente.nombre}</h2>}
        >
            <Head title={`Cargos` }  />
            
            <div className="bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="mb-6">
                        <Link 
                            href="#"
                            onClick={() => window.history.back()}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver a Docentes
                        </Link>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold text-white">{cargo.nombre}</h1>
                                    </div>
                                    <div className="flex items-center gap-4 text-blue-100">
                                        <span className="flex items-center gap-2">
                                            {/* Icono de Código */}
                                            Horas: {cargo.sum_horas_frente_aula}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            {/* Icono de Código */}
                                            NroMaterias: {cargo.nro_materias_asig}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Link
                                        href={route('cargos.destroy', cargo.id)} 
                                        method="delete"
                                        as="button"
                                        onBefore={() => confirm('¿Estás seguro de que deseas eliminar este cargo?')}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2 font-semibold"
                                    >
                                        {/* Icono de Eliminar */}
                                        Eliminar
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import Button from '@/Components/Button';
import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import { Head, Link } from '@inertiajs/react';
import ComisionInfo from './Partials/ComisionInfo';
import ComisionDocentes from './Partials/ComisionDocentes';
import ComisionHorarios from './Partials/ComisionHorarios';

export default function ShowComision({ auth, comision, flash, docentes, allDocentes, can = { update: false, delete: false } }) {

    const [currentTab, setCurrentTab] = useState('informacion');

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Comisión: {comision.nombre}
                </h2>
            }
        >
            <Head title={`Comisión: ${comision.nombre}`} />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">

                    {/* Botón Volver */}
                    <div className="mb-4">
                        <Button variant="secondary"
                            as="a"
                            href={route('comisiones.index')}
                            className="flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Volver al Listado
                        </Button>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    {flash?.error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {flash.error}
                        </div>
                    )}

                    {/* ENCABEZADO ESTILO DOCENTES */}
                    <div className="bg-white rounded-t-lg shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                            <div className="flex justify-between items-start">

                                {/* Información principal */}
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-white mb-2">
                                        {comision.nombre}
                                    </h1>

                                    <div className="flex items-center gap-4 text-blue-100">
                                        <span className="flex items-center gap-2">
                                            Año: {comision.anio}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            Turno: {comision.turno}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            Creado: {comision.created_at ? new Date(comision.created_at).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {can.update && (
                                        <Button variant="primary"
                                            as={Link}
                                            href={route('comisiones.edit', comision.id)}
                                        >
                                            Editar comisión
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ZONA DE TABS ESTILO DOCENTES */}
                    <div className="bg-white shadow-lg rounded-b-lg border-t border-gray-200">

                        {/* Navegación Tabs */}
                        <div className="px-8 pt-6 border-b border-gray-200">
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setCurrentTab('informacion')}
                                    className={`px-4 py-2 font-semibold transition border-b-2 ${currentTab === 'informacion'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Información
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setCurrentTab('docentes')}
                                    className={`px-4 py-2 font-semibold transition border-b-2 ${currentTab === 'docentes'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Docentes
                                </button>


                                <button
                                    type="button"
                                    onClick={() => setCurrentTab('horarios')}
                                    className={`px-4 py-2 font-semibold transition border-b-2 ${
                                        currentTab === 'horarios'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Horarios
                                </button>
                            </div>
                        </div>

                        {/* Contenido dinámico */}
                        <div className="p-8">
                            {currentTab === 'informacion' && (
                                <ComisionInfo comision={comision} />
                            )}
                            {currentTab === 'docentes' && (
                                <ComisionDocentes
                                    comision={comision}
                                    docentes={docentes}
                                    allDocentes={allDocentes}
                                    can={can}
                                />
                            )}
                            {currentTab === 'horarios' && (
                                <ComisionHorarios
                                    comision={comision}
                                    canDelete={can.deleteHorario}
                                />
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import DocenteInfo from './Partials/DocenteInfo';             // <--- Nuevo
import DocenteComisiones from './Partials/DocenteComisiones'; // <--- Nuevo
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';
import DangerButton from '@/Components/Buttons/DangerButton';

export default function Show({ auth, docente, comisiones }) { // <--- Agregamos 'comisiones'

    const [currentTab, setCurrentTab] = useState('informacion');

    const handleDelete = () => {
        if (confirm(`¿Estás seguro de que quieres eliminar al docente ${docente.nombre} ${docente.apellido}?`)) {
            router.delete(route('docentes.destroy', docente.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Docente: {docente.nombre} {docente.apellido}</h2>}
        >
            <Head title={`Docente: ${docente.nombre} ${docente.apellido}`} />
                    {/* Botón Volver */}
                    <div className="mb-4">
                        <SecondaryButton
                            as={Link}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                window.history.back();
                            }}
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
                            Volver
                        </SecondaryButton>
                    </div>

                    {/* ENCABEZADO (Tu diseño original) */}
                    <div className="bg-white rounded-t-lg shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold text-white">{docente.apellido}, {docente.nombre}</h1>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${docente.es_activo
                                            ? 'bg-green-400 text-green-900'
                                            : 'bg-red-400 text-red-900'
                                            }`}>
                                            {docente.es_activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-blue-100">
                                        <span className="flex items-center gap-2">Legajo: {docente.legajo}</span>
                                        {/* Agregamos validación por si created_at es nulo */}
                                        <span className="flex items-center gap-2">Creado: {docente.created_at ? new Date(docente.created_at).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <PrimaryButton
                                        as={Link}
                                        href={route('docentes.edit', docente.id)}
                                    >
                                        Editar
                                    </PrimaryButton>
                                    <DangerButton
                                        onClick={handleDelete}
                                    >
                                        Eliminar
                                    </DangerButton>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ZONA DE TABS */}
                    <div className="bg-white shadow-lg rounded-b-lg border-t border-gray-200">
                        {/* Navegación de Tabs */}
                        <div className="px-8 pt-6 border-b border-gray-200">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setCurrentTab('informacion')}
                                    className={`px-4 py-2 font-semibold transition border-b-2 ${currentTab === 'informacion'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Información
                                </button>
                                <button
                                    onClick={() => setCurrentTab('comisiones')}
                                    className={`px-4 py-2 font-semibold transition border-b-2 ${currentTab === 'comisiones'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Comisiones
                                </button>
                            </div>
                        </div>

                        {/* Contenido Dinámico */}
                        <div className="p-8">
                            {currentTab === 'informacion' ? (
                                <DocenteInfo docente={docente} />
                            ) : (
                                <DocenteComisiones comisiones={comisiones} />
                            )}
                        </div>
                    </div>

        </AuthenticatedLayout>
    );
}
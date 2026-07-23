import Button from '@/Components/Button';
import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import MateriaInfo from './Partials/MateriaInfo';
import MateriaComisiones from './Partials/MateriaComisiones';

export default function Show({ auth, materia, flash, comisiones, can = { update: false, delete: false } }) {

    const [currentTab, setCurrentTab] = useState('informacion');

    const handleDelete = () => {
        if (confirm(`¿Estás seguro de eliminar la materia "${materia.nombre}"?`)) {
            router.delete(route('materias.destroy', materia.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Materia: {materia.nombre}
                </h2>
            }
        >
            <Head title={`Materia: ${materia.nombre}`} />


                    {/* Botón Volver */}
                    <div className="mb-4">
                        <Button variant="secondary"
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

                    {/* ENCABEZADO estilo Docente */}
                    <div className="bg-white rounded-t-lg shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">

                            <div className="flex justify-between items-start">
                                {/* INFO */}
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-white mb-1">
                                        {materia.nombre}
                                    </h1>

                                    <div className="flex items-center gap-4 text-blue-100">
                                        <span>Código: {materia.codigo || 'N/A'}</span>
                                        {/* created_at con validación */}
                                        <span>
                                            Creada:{' '}
                                            {materia.created_at
                                                ? new Date(materia.created_at).toLocaleDateString()
                                                : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Botones */}
                                <div className="flex gap-3">
                                    {can.update && (
                                        <Button variant="primary"
                                            as={Link}
                                            href={route('materias.edit', materia.id)}
                                        >
                                            Editar
                                        </Button>
                                    )}

                                    {/* Solo si querés eliminar materias */}
                                    {can.delete && (
                                        <Button variant="danger"
                                            onClick={handleDelete}
                                        >
                                            Eliminar
                                        </Button>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ZONA DE TABS */}
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

                        {/* Contenido dinámico */}
                        <div className="p-8">
                            {currentTab === 'informacion' ? (
                                <MateriaInfo materia={materia} />
                            ) : (
                                <MateriaComisiones
                                    comisiones={comisiones}
                                    materia={materia}
                                    canDelete={can.delete}
                                />
                            )}
                        </div>
                    </div>


        </AuthenticatedLayout>
    );
}

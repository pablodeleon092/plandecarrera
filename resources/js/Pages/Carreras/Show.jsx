import Button from '@/Components/Button';
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CarreraInfo from './Partials/CarreraInfo';
import CarreraMaterias from './Partials/CarreraMaterias';

export default function Show({ auth, carrera, planes }) {
    const [tab, setTab] = useState('info');

    const handleDelete = () => {
        if (confirm(`¿Estás seguro de eliminar la carrera "${carrera.nombre}"?`)) {
            router.delete(route('carreras.destroy', carrera.id), {
                onSuccess: () => router.visit(route('carreras.index')),
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Carrera: {carrera.nombre}
                </h2>
            }
        >
            <Head title={`Carrera: ${carrera.nombre}`} />


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
                            Volver al Listado
                        </Button>
                    </div>

                    {/* ENCABEZADO estilo Materia/Docente */}
                    <div className="bg-white rounded-t-lg shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">

                            <div className="flex justify-between items-start">

                                {/* Información de la carrera */}
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-white mb-1">
                                        {carrera.nombre}
                                    </h1>
                                </div>

                                {/* Botones */}
                                <div className="flex gap-3">
                                    <Button variant="primary"
                                        as={Link}
                                        href={route('carreras.edit', carrera.id)}
                                    >
                                        Editar
                                    </Button>

                                    <Button variant="danger"
                                        onClick={handleDelete}
                                    >
                                        Eliminar
                                    </Button>
                                </div>

                            </div>

                        </div>
                    </div>

                    {/* ZONA DE TABS */}
                    <div className="bg-white shadow-lg rounded-b-lg border-t border-gray-200">

                        <div className="px-8 pt-6 border-b border-gray-200">
                            <div className="flex gap-4">

                                <button
                                    onClick={() => setTab('info')}
                                    className={`px-4 py-2 font-semibold transition border-b-2 ${tab === 'info'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Información
                                </button>

                                <button
                                    onClick={() => setTab('plan')}
                                    className={`px-4 py-2 font-semibold transition border-b-2 ${tab === 'plan'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Plan de Estudio
                                </button>

                            </div>
                        </div>

                        {/* Contenido dinámico */}
                        <div className="p-8">
                            {tab === 'info' ? (
                                <CarreraInfo carrera={carrera} />
                            ) : (
                                <CarreraMaterias 
                                    carrera={carrera} 
                                    planes={planes} 
                                />
                            )}
                        </div>

                    </div>

        </AuthenticatedLayout>
    );
}

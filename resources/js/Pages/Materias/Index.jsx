import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import ListHeader from '@/Components/ListHeader';
import DataTable from '@/Components/DataTable';
import GestionMaterias from '@/Components/Filters/GestionMaterias';
import PaginatorButtons from '@/Components/Buttons/PaginatorButtons';
import KPICard from '@/Components/Dashboard/KPICard';

export default function Index({ auth, institutos, carreras, materias, filters, flash }) {

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar esta materia?')) {
            router.delete(route('materias.destroy', id));
        }
    };

    const handleToggleStatus = (materia) => {
        router.patch(route('materias.toggleStatus', materia), {}, {
            preserveScroll: true
        });
    };

    // Totales
    const totalMaterias = materias.meta?.total || materias.length;
    const materiasActivas = useMemo(() => materias.filter(m => m.estado).length, [materias]);
    const materiasCuatrimestrales = useMemo(() => materias.filter(m => m.regimen === 'cuatrimestral').length, [materias]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Gestión de Materias</h2>}
        >
            <Head title="Materias" />

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

                    {/* HEADER */}
                    <ListHeader
                        title="Listado de Materias"
                        buttonLabel="Nueva Materia"
                        buttonRoute={route('materias.create')}
                    />

                    {/* FILTROS */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <GestionMaterias
                            institutos = {institutos}
                            carreras = {carreras}
                        />
                    </div>
                    {/* TABLA */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">

                        <DataTable
                            columns={[
                                { key: 'codigo', label: 'Código' },
                                { key: 'nombre', label: 'Nombre' },
                                {
                                    key: 'regimen',
                                    label: 'Régimen',
                                    render: (m) => (
                                        <span
                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${m.regimen === 'anual'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}>
                                            {m.regimen}
                                        </span>
                                    )
                                },
                                {
                                    key: 'cuatrimestre',
                                    label: 'Cuatrimestre',
                                    render: (m) => m.cuatrimestre ? `${m.cuatrimestre}°` : '—'
                                },
                                {
                                    key: 'horas',
                                    label: 'Horas',
                                    render: (m) => (
                                        <div>
                                            <div className="text-sm text-gray-900">{m.horas_semanales}hs/sem</div>
                                            <div className="text-xs text-gray-500">{m.horas_totales}hs total</div>
                                        </div>
                                    )
                                },

                                {
                                    key: 'estado',
                                    label: 'Estado',
                                    render: (m) => (
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${m.estado
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {m.estado ? 'Activa' : 'Inactiva'}
                                        </span>
                                    )
                                }
                            ]}
                            data={materias}
                            onShow={(materia) => router.visit(route('materias.show', materia.id))}
                            onEdit={(materia) => router.visit(route('materias.edit', materia.id))}
                            onDelete={(materia) => handleDelete(materia.id, materia.nombre, materia.apellido)}
                            onToggleStatus={(materia) => handleToggleStatus(materia.id)}
                            emptyMessage="No se encontraron materias."
                            hover={true}
                            emptyIcon={
                                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            }
                        />
                    </div>

                    {/* CARDS TOTALES */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <KPICard
                            title="Total Materias"
                            value={totalMaterias}
                            status="neutral"
                        />
                        <KPICard
                            title="Materias Activas"
                            value={materiasActivas}
                            status="success"
                        />
                        <KPICard
                            title="Materias Cuatrimestrales"
                            value={materiasCuatrimestrales}
                            status="warning"
                        />
                    </div>

        </AuthenticatedLayout>
    );
}

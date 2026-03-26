import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import ListHeader from '@/Components/ListHeader';
import DataTable from '@/Components/DataTable';
import GestionComisiones from '@/Components/Filters/GestionComisiones';
import PaginatorButtons from '@/Components/Buttons/PaginatorButtons';

export default function Index({ auth, comisiones, carreras, institutos, flash}) {


    const handleToggleStatus = (comision) => {
        router.patch(route('comisiones.toggleStatus', comision), {}, {
            preserveScroll: true
        });
    };


    const columns = [
        {
            key: 'codigo',
            label: 'Codigo',
            className: 'text-sm font-medium text-gray-900',
            nowrap: false
        },
        {
            key: 'id_materia',
            label: 'Materia',
            render: (comision) => (
                <span className="text-sm text-gray-900 block min-w-[150px] whitespace-normal">
                    {comision.materia?.nombre || '-'}
                </span>
            ),
            nowrap: false
        },
        {
            key: 'turno',
            label: 'Turno',
            className: 'text-sm font-medium text-gray-900',
        },
        {
            key: 'modalidad',
            label: 'Modalidad',
            className: 'text-sm font-medium text-gray-900',
        },
        {
            key: 'sede',
            label: 'Sede',
            className: 'text-sm font-medium text-gray-900',
        },
        {
            key: 'anio',
            label: 'Año',
            className: 'text-sm font-medium text-gray-900',
        },
        {
            key: 'horarios',
            label: 'Horarios',
            render: (comision) => (
                <div className="text-sm text-gray-700 space-y-1">
                    {comision.horarios && comision.horarios.length > 0 ? (
                        comision.horarios.map((h) => (
                            <div key={h.id} className="capitalize">
                                {h.dia_semana} {h.hora_inicio.substring(0, 5)}–{h.hora_fin.substring(0, 5)}
                            </div>
                        ))
                    ) : (
                        <span className="text-gray-400">—</span>
                    )}
                </div>
            )
        },
    ];

    const handleDelete = (comision) => {
        if (confirm('¿Estás seguro de eliminar esta comision?')) {
            router.delete(route('comisiones.destroy', comision.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Gestión de Comisiones</h2>}
        >
            <Head title="Comisiones" />

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


            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <ListHeader
                        title="Listado de Comisiones"
                    />
 
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <GestionComisiones
                            institutos = {institutos}
                            carreras = {carreras}
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <DataTable
                            dense={true}
                            columns={columns}
                            data={comisiones.data}
                            onShow={(comision) => router.visit(route('comisiones.show', comision.id))}
                            onEdit={(comision) => router.visit(route('comisiones.edit', comision.id))}
                            onDelete={handleDelete}
                            onToggleStatus={(comision) => handleToggleStatus(comision.id)}
                            hover={true}
                            emptyMessage="No se encontraron comisiones"
                            emptyIcon={
                                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            }
                        />
                    </div>

                    <PaginatorButtons meta={comisiones?.meta} paginator={comisiones} routeName={'comisiones.index'}/>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-600">Total Comisiones</p>
                            <p className="text-2xl font-bold text-gray-900">{comisiones.meta?.total || comisiones.data.length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import ListHeader from '@/Components/ListHeader';
import GestionCarreras from '@/Components/Filters/GestionCarreras';
import DataTable from '@/Components/DataTable';
import TableFilters from '@/Components/TableFilters';
import PaginatorButtons from '@/Components/Buttons/PaginatorButtons';
import KPICard from '@/Components/Dashboard/KPICard';

export default function Index({ auth, carreras, institutos, filters }) {

    const columns = [
        {
            key: 'nombre',
            label: 'Carrera',
            className: 'text-sm font-medium text-gray-900',
            nowrap: false
        },
        {
            key: 'instituto',
            label: 'Instituto',
            render: (carrera) => (
                <span className="text-sm text-gray-900">
                    {carrera.instituto?.siglas || '-'}
                </span>
            )
        },

        {
            key: 'estado',
            label: 'Estado',
            render: (carrera) => (
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${carrera.estado
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {carrera.estado ? 'Activa' : 'Inactiva'}
                </span>
            )
        }
    ];

    const handleDelete = (carrera) => {
        if (confirm('¿Estás seguro de eliminar esta carrera?')) {
            router.delete(route('carreras.destroy', carrera.id));
        }
    };

    const handleToggleStatus = (carrera) => {
        // Realiza la petición para cambiar el estado directamente, sin confirmación.
        router.patch(route('carreras.toggleStatus', carrera.id), {},
            { preserveScroll: true });
    };

    // Calcular totales para las tarjetas de resumen
    const totalCarreras = carreras.meta?.total || carreras.data.length;
    const carrerasActivas = useMemo(() => carreras.data.filter(c => c.estado).length, [carreras.data]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Gestión de Carreras</h2>}
        >
            <Head title="Carreras" />

                    <ListHeader
                        title="Listado de Carreras"
                        buttonLabel="Agregar Carrera"
                        buttonRoute={route('carreras.create')}
                    />
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <GestionCarreras
                            institutos = {institutos}
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={carreras.data}
                            onShow={(carrera) => router.visit(route('carreras.show', carrera.id))}
                            onEdit={(carrera) => router.visit(route('carreras.edit', carrera.id))}
                            onDelete={handleDelete}
                            onToggleStatus={handleToggleStatus}
                            hover={true}
                            emptyMessage="No se encontraron carreras"
                            emptyIcon={
                                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            }
                        />
                    </div>

                    <PaginatorButtons meta={carreras?.meta} paginator={carreras} routeName={'carreras.index'} />

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <KPICard
                            title="Total Carreras"
                            value={totalCarreras}
                            status="neutral"
                        />
                        <KPICard
                            title="Carreras Activas"
                            value={carrerasActivas}
                            status="success"
                        />
                    </div>

        </AuthenticatedLayout>
    );
}

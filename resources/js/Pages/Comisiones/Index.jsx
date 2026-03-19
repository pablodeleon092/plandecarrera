import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import ListHeader from '@/Components/ListHeader';
import DataTable from '@/Components/DataTable';
import TableFilters from '@/Components/TableFilters';
import PaginatorButtons from '@/Components/Buttons/PaginatorButtons';
import KPICard from '@/Components/Dashboard/KPICard';

export default function Index({ auth, comisiones, modalidades, sedes, flash, filters: initialFilters = {} }) {
    const [filters, setFilters] = useState({
        search: initialFilters.search || '',
        modalidad: initialFilters.modalidad || '',
        sede: initialFilters.sede || ''
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        router.get(route('comisiones.index'), newFilters, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleToggleStatus = (comision) => {
        router.patch(route('comisiones.toggleStatus', comision), {}, {
            preserveScroll: true
        });
    };

    const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== '' && value !== null)
    );

    // Calcular totales para las tarjetas de resumen
    const totalComisiones = comisiones.meta?.total || comisiones.data.length;
    const comisionesActivas = useMemo(() => comisiones.data.filter(c => c.estado).length, [comisiones.data]);

    const filterConfig = [
        {
            key: 'search',
            label: 'Buscar',
            type: 'text',
            value: filters.search,
            placeholder: 'Buscar por codigo o materia...'
        },
        {
            key: 'modalidad',
            label: 'Modalidad',
            type: 'select',
            value: filters.modalidad,
            options: modalidades.map(m => ({ value: m, label: m }))
        },
        {
            key: 'sede',
            label: 'Sede',
            type: 'select',
            value: filters.sede,
            options: sedes.map(s => ({ value: s, label: s }))
        }
    ];

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
            key: 'horas',
            label: 'Horas (T/P)',
            render: (c) => (
                <div className="text-xs">
                    <span className="font-semibold">{c.horas_teoricas}</span> / <span className="font-semibold">{c.horas_practicas}</span>
                </div>
            )
        },

        {
            key: 'estado',
            label: 'Estado',
            render: (comision) => (
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${comision.estado
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {comision.estado ? 'Activa' : 'Inactiva'}
                </span>
            )
        }
    ];

    const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== '' && value !== null)
    );


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
                        <TableFilters
                            filters={filterConfig}
                            onChange={handleFilterChange}
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

                    <PaginatorButtons meta={comisiones?.meta} paginator={comisiones} routeName={'comisiones.index'} routeParams={activeFilters} />

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <KPICard
                            title="Total Comisiones"
                            value={totalComisiones}
                            status="neutral"
                        />
                        <KPICard
                            title="Comisiones Activas"
                            value={comisionesActivas}
                            status="success"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

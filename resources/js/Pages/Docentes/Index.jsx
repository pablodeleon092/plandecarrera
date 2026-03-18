// resources/js/Pages/Docentes/Index.jsx

import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import ListHeader from '@/Components/ListHeader';
import DataTable from '@/Components/DataTable';
import TableFilters from '@/Components/TableFilters';
import PaginatorButtons from '@/Components/Buttons/PaginatorButtons';
import { PrinterIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, institutos, carreras, docentes, flash, filters: initialFilters = {} }) {
    const [filters, setFilters] = useState({
        search: initialFilters.search || '',
        cargos: initialFilters.cargos || '',
        es_activo: initialFilters.es_activo || '',
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        router.get(route('docentes.index'), newFilters, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };


    const filterConfig = [
        {
            key: 'search', label: 'Nombre', type: 'text', value: filters.search, placeholder: 'Buscar por nombre, apellido o legajo...'
        },
        {
            key: 'cargos', label: 'Cargo', type: 'text', value: filters.cargos, placeholder: 'Buscar por cargo...'
        },
        {
            key: 'es_activo', label: 'Estado', type: 'select', value: filters.es_activo,
            options: [
                { value: '1', label: 'Activo' },
                { value: '0', label: 'Inactivo' }
            ]
        },        
        {
            key: 'instituto_id',
            label: 'Instituto',
            type: 'select',
            value: filters.instituto_id,
            options: institutos.map(inst => ({ value: inst.id.toString(), label: inst.nombre }))
        },
        {
            key: 'carrera_id',
            label: 'Carrera',
            type: 'select',
            value: filters.carrera_id,
            options: carreras.map(c => ({ value: c.id.toString(), label: c.nombre })),
            disabled: !filters.instituto_id // Se deshabilita si no hay instituto elegido
        },
        {
            key: 'materia', label: 'Materia', type: 'text', value: filters.materia, placeholder: 'Buscar por materia...'
        }
    ];

    const handleExportarPdf = () => {

        const params = Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
        );

        const queryString = new URLSearchParams(params).toString();

        const url = route('docentes.exportar') + (queryString ? `?${queryString}` : '');
        window.location.href = url; 
    };
    
    const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== '' && value !== null)
    );

    // Función que maneja la eliminación de un docente
    const handleDelete = (id, nombre, apellido) => {
        if (confirm(`¿Estás seguro de eliminar a ${nombre} ${apellido}?`)) {
            router.delete(route('docentes.destroy', id));
        }
    };

    const handleToggleStatus = (docente) => {
        router.patch(route('docentes.toggleStatus', docente.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Optional: Show a toast or notification if not handled by flash messages automatically
            }
        });
    };

    // Calcular totales para las tarjetas de resumen
    const totalDocentes = docentes.meta?.total || docentes.data.length;
    const docentesActivos = useMemo(() => docentes.data.filter(d => d.es_activo).length, [docentes.data]);
    const docentesInactivos = useMemo(() => docentes.data.filter(d => !d.es_activo).length, [docentes.data]);


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gestión de Docentes</h2>}
        >
            <Head title="Docentes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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

                    <ListHeader
                        title="Listado de Docentes"
                        buttonLabel="Agregar Docente"
                        buttonRoute={route('docentes.create')}
                    />

                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <TableFilters
                            filters={filterConfig}
                            onChange={handleFilterChange}
                        />
                        <button
                            onClick={handleExportarPdf}
                            className="inline-flex items-center px-4 py-2 bg-red-600 border 
                            border-transparent rounded-md font-semibold 
                            text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-900 focus:outline-none focus:border-red-900 focus:ring ring-red-300 disabled:opacity-25 transition ease-in-out duration-150"
                            title="Exportar lista filtrada a PDF"
                        >
                            <PrinterIcon className="w-4 h-4" />
                            Exportar PDF
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <DataTable
                            columns={[
                                { key: 'legajo', label: 'Legajo' },
                                { key: 'nombre_completo', label: 'Nombre Completo', render: (doc) => `${doc.apellido}, ${doc.nombre}` },
                                { key: 'email', label: 'Email' },
                                {
                                    key: 'es_activo', label: 'Estado', render: (doc) => (
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doc.es_activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {doc.es_activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    )
                                },
                                {
                                    key: 'cargos', label: 'Cargos', render: (doc) => (
                                        doc.cargos.length > 0
                                            ? doc.cargos
                                                .map(cargo => (
                                                    <Link
                                                        key={cargo.id}
                                                        href={route('cargos.show', cargo.id)}
                                                        className="text-indigo-600 hover:underline"
                                                    >
                                                        {cargo.nombre}
                                                    </Link>
                                                )).reduce((prev, curr) => [prev, ', ', curr]) : '—'
                                    )
                                },
                                {
                                    key: 'materias',
                                    label: 'Materias',
                                    render: (doc) => {
                                        if (!doc.dictas) return <span className="text-gray-400">Sin materias</span>;
                                        const links = doc.dictas.map((dicta) => {
                                            const materia = dicta.comision?.materia;
                                            if (!materia) return null;
                                            return (
                                                <Link
                                                    key={materia.id}
                                                    href={route('materias.show', materia.id)} 
                                                    className="text-indigo-600 hover:underline"
                                                >
                                                    {materia.nombre}
                                                </Link>
                                            );
                                        }).filter(Boolean); 
                                        return links.length > 0 
                                            ? links.reduce((prev, curr) => [prev, ', ', curr])
                                            : <span className="text-gray-400">Sin materias</span>;
                                    }
                                }
                            ]}
                            data={docentes.data}
                            onShow={(docente) => router.visit(route('docentes.show', docente.id))}
                            onEdit={(docente) => router.visit(route('docentes.edit', docente.id))}
                            onDelete={(docente) => handleDelete(docente.id, docente.nombre, docente.apellido)}
                            onToggleStatus={handleToggleStatus}
                            statusKey="es_activo"
                            hover={true}
                            emptyMessage="No se encontraron docentes."
                            emptyIcon={
                                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-3.072a3 3 0 00-6 0V21" />
                                </svg>
                            }
                        />
                    </div>
                    <PaginatorButtons meta={docentes.meta} paginator={docentes} routeName={'docentes.index'}
                        routeParams={activeFilters}
                    />

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-600">Total Docentes</p>
                            <p className="text-2xl font-bold text-gray-900">{totalDocentes}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-600">Docentes Activos</p>
                            <p className="text-2xl font-bold text-green-600">
                                {docentesActivos}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-600">Docentes Inactivos</p>
                            <p className="text-2xl font-bold text-red-600">
                                {docentesInactivos}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
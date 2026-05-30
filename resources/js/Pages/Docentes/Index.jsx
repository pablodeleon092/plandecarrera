// resources/js/Pages/Docentes/Index.jsx

import { useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import ListHeader from '@/Components/ListHeader';
import DataTable from '@/Components/DataTable';
import GestionPersonal from '@/Components/Filters/GestionPersonal';
import PaginatorButtons from '@/Components/Buttons/PaginatorButtons';
import KPICard from '@/Components/Dashboard/KPICard';
import { usePermissions } from '@/Hooks/usePermissions';

export default function Index({ auth, institutos, carreras, docentes, flash, filters, dedicaciones}) {
    const { canCreateDocente, canDeleteDocente } = usePermissions();

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
    const totalDocentes = docentes.meta?.total || docentes.length;
    const docentesActivos = useMemo(() => docentes.filter(d => d.es_activo).length, [docentes]);
    const docentesInactivos = useMemo(() => docentes.filter(d => !d.es_activo).length, [docentes]);


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gestión de Docentes</h2>}
        >
            <Head title="Docentes" />

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

                    { canCreateDocente && (
                        <ListHeader
                            title="Listado de Docentes"
                            buttonLabel="Agregar Docente"
                            buttonRoute={route('docentes.create')}
                        />  
                    )}

                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <GestionPersonal
                            institutos = {institutos}
                            carreras = {carreras}
                            dedicaciones={dedicaciones}
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <DataTable
                            columns={[
                                { key: 'legajo', 
                                  label: 'Legajo' },
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
                                        if (!doc.materias) return <span className="text-gray-400">Sin materias</span>;
                                        const links = doc.materias.flatMap((materia) => {
                                            if (!materia) return [];
                                            return [
                                                <Link
                                                    key={materia.id}
                                                    href={route('materias.show', materia.id)} 
                                                    className="text-indigo-600 hover:underline"
                                                >
                                                    {materia.nombre}
                                                </Link>
                                            ];
                                        });
                                        return links.length > 0 
                                            ? <div className="flex flex-col gap-y-1">{links}</div>
                                            : <span className="text-gray-400">Sin materias</span>;
                                    }
                                }
                            ]}
                            data={docentes}
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
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <KPICard
                            title="Total Docentes"
                            value={totalDocentes}
                            status="neutral"
                        />
                        <KPICard
                            title="Docentes Activos"
                            value={docentesActivos}
                            status="success"
                        />
                        <KPICard
                            title="Docentes Inactivos"
                            value={docentesInactivos}
                            status="danger"
                        />
                    </div>
        </AuthenticatedLayout>
    );
}
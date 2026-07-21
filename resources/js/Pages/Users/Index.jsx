import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import DataTable from '@/Components/DataTable';
import ListHeader from '@/Components/ListHeader';
import TableFilters from '@/Components/TableFilters';

export default function Index({ auth, users, can = { create: false } }) {
    const userList = users?.data || [];
    const { delete: inertiaDelete } = useForm({});

    const [filters, setFilters] = useState({
        search: '',
        cargo: '',
        instituto: ''
    });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Get unique cargos and institutos for filter options
    const cargos = [...new Set(userList.map(u => u.cargo))].filter(Boolean);
    const institutos = [...new Set(userList.map(u => u.instituto?.siglas))].filter(Boolean);

    const filterConfig = [
        {
            key: 'search',
            label: 'Buscar',
            type: 'text',
            value: filters.search,
            placeholder: 'Buscar por nombre o instituto...'
        },
        {
            key: 'cargo',
            label: 'Cargo',
            type: 'select',
            value: filters.cargo,
            options: cargos.map(c => ({ value: c, label: c }))
        },
        {
            key: 'instituto',
            label: 'Instituto',
            type: 'select',
            value: filters.instituto,
            options: institutos.map(i => ({ value: i, label: i }))
        }
    ];

    const filteredData = useMemo(() => {
        return users.data.filter(user => {
            const matchSearch = !filters.search ||
                user.nombre.toLowerCase().includes(filters.search.toLowerCase());
            const matchInstituto = !filters.instituto || user.instituto?.siglas === filters.instituto;
            const matchCargo = !filters.cargo || user.cargo === filters.cargo;
            return matchSearch && matchInstituto && matchCargo;
        });
    }, [users.data, filters]);

    const columns = [
        {
            key: 'name',
            label: 'Usuario',
            className: 'text-sm font-medium text-gray-900',
            nowrap: false
        },
        {
            key: 'nombre',
            label: 'Nombre Completo',
            render: (user) => (
                <span className="text-sm text-gray-900">
                    {`${user.nombre || ''} ${user.apellido || ''}`.trim() || '-'}
                </span>
            )
        },
        {
            key: 'email',
            label: 'Email',
            render: (user) => (
                <span className="text-sm text-gray-900">
                    {user.email || '-'}
                </span>
            )
        },
        {
            key: 'activo',
            label: 'Activo',
            render: (user) => (
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.is_activo ? 'Sí' : 'No'}
                </span>
            )
        },
        {
            key: 'cargo',
            label: 'Cargo',
            render: (user) => (
                <span className="text-sm text-gray-900">
                    {user.cargo || '-'}
                </span>
            )
        },
        {
            key: 'instituto',
            label: 'Instituto',
            render: (user) => (
                <span className="text-sm text-gray-900">
                    {user.instituto?.nombre || 'Global'}
                </span>
            )
        }
    ]

    const handleToggleStatus = (user) => {
        router.patch(route('users.toggleStatus', user.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Optional: Show toast or notification
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Usuarios</h2>}
        >
            <Head title="Usuarios" />

                <ListHeader
                    title="Listado de Usuarios"
                    buttonLabel="Agregar Usuario"
                    buttonRoute={can.create ? route('users.create') : null}
                />

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <TableFilters
                        filters={filterConfig}
                        onChange={handleFilterChange}
                    />
                </div>
                <DataTable
                    columns={columns}
                    data={filteredData}
                    
                    onShow={(user) => router.visit(route('users.show', user.id))}
                    onEdit={(user) => router.visit(route('users.edit', user.id))}
                    onDelete={(user) => {
                            if (confirm('¿Eliminar usuario?')) {
                                // Asumo que `inertiaDelete` es una función/hook de Inertia para DELETE (como `router.delete`)
                                inertiaDelete(route('users.destroy', user.id));
                            }
                        }}
                    onToggleStatus={handleToggleStatus}
                    statusKey="is_activo"
                    hover={true}
                    emptyMessage="No hay usuarios para mostrar."
                    emptyIcon={
                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    }
                    disableScroll={true}
                />

        </AuthenticatedLayout>
    );
}

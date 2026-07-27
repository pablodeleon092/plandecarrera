import Button from '@/Components/Button';
import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ user, can = { update: false, delete: false } }) {
    const { auth } = usePage().props;

    const handleDelete = () => {
        if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.nombre} ${user.apellido}?`)) {
                router.delete(route('users.destroy', user.id));
            }
        };
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Detalle de Usuario
                </h2>
            }
        >
            <Head title={`Usuario: ${user.name}`} />
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="bg-white rounded-t-lg shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold text-white">{user.nombre} {user.apellido}</h1>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.is_activo
                                            ? 'bg-green-400 text-green-900'
                                            : 'bg-red-400 text-red-900'
                                            }`}>
                                            {user.is_activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-blue-100">
                                        <span className="flex items-center gap-2">Email: {user.email}</span>
                                        {/* Agregamos validación por si created_at es nulo */}
                                        <span className="flex items-center gap-2">Creado: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {can.update && (
                                        <Button variant="primary"
                                            as={Link}
                                            href={`${route('users.edit', user.id)}?from=show`}
                                        >
                                            Editar
                                        </Button>
                                    )}
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
                    <div className="border-t border-gray-200">
                        <dl>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Nombre Completo
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {user.nombre} {user.apellido}
                                </dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Username
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {user.name}
                                </dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Email
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {user.email}
                                </dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    DNI
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {user.dni}
                                </dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Cargo
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {user.cargo}
                                </dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Instituto
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {user.instituto?.siglas || 'N/A'}
                                </dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Estado
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.is_activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button variant="info" as={Link} href={route('users.index')} replace>
                        Volver
                    </Button>
                </div>
        </AuthenticatedLayout>
    );
}

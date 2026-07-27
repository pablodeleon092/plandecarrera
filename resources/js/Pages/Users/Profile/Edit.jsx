import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status,user, institutos, can = { delete: false } }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <h3 className="text-lg font-semibold mb-4">Información del usuario</h3>
                        <div className="space-y-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">DNI</label>
                                <p className="mt-1 text-gray-900">{user.dni}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <p className="mt-1 text-gray-900">{user.nombre}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                                <p className="mt-1 text-gray-900">{user.apellido}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cargo</label>
                                <p className="mt-1 text-gray-900">{user.cargo}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Instituto</label>
                                <p className="mt-1 text-gray-900">
                                    {user.instituto_id
                                        ? institutos.find(i => i.id === user.instituto_id)?.siglas
                                        : 'No asignado'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />

                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    {can.delete && (
                        <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function DashboardAdmin({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard Administrador
                </h2>
            }
        >
            <Head title="Crear Vista" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6 text-center">
                        
                        <h1 className="text-2xl font-bold text-gray-700">
                            Crear Vista
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Este es el espacio asignado para el panel de administración.
                        </p>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
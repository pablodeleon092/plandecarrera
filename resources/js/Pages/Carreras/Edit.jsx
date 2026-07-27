import Button from '@/Components/Button';
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const modalidades = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'mixta', label: 'Mixta' },
];

const sedes = ['Ushuaia', 'Rio Grande', 'Ushuaia/Rio Grande'];

export default function Edit({ auth, carrera, institutos = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        nombre: carrera.nombre || '',
        modalidad: carrera.modalidad || '',
        sede: carrera.sede || '',
        instituto_id: carrera.instituto_id || '',
    });

    const submit = (event) => {
        event.preventDefault();
        put(route('carreras.update', carrera.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Editar Carrera</h2>}
        >
            <Head title={`Editar Carrera - ${carrera.nombre}`} />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <Button
                    variant="secondary"
                    as={Link}
                    href={route('carreras.index')}
                    className="mb-5 inline-flex items-center gap-2"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver al listado
                </Button>

                <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-5">
                        <h1 className="text-2xl font-semibold text-gray-900">Datos de la carrera</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Actualizá la información institucional de {carrera.nombre}.
                        </p>
                    </div>

                    <form onSubmit={submit} className="p-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                                    Nombre de la carrera
                                </label>
                                <input
                                    id="nombre"
                                    type="text"
                                    value={data.nombre}
                                    onChange={(event) => setData('nombre', event.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                    autoFocus
                                />
                                {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                            </div>

                            <div>
                                <label htmlFor="modalidad" className="block text-sm font-medium text-gray-700">
                                    Modalidad
                                </label>
                                <select
                                    id="modalidad"
                                    value={data.modalidad}
                                    onChange={(event) => setData('modalidad', event.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Seleccione una modalidad</option>
                                    {modalidades.map((modalidad) => (
                                        <option key={modalidad.value} value={modalidad.value}>
                                            {modalidad.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.modalidad && <p className="mt-1 text-sm text-red-600">{errors.modalidad}</p>}
                            </div>

                            <div>
                                <label htmlFor="sede" className="block text-sm font-medium text-gray-700">
                                    Sede
                                </label>
                                <select
                                    id="sede"
                                    value={data.sede}
                                    onChange={(event) => setData('sede', event.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Seleccione una sede</option>
                                    {sedes.map((sede) => (
                                        <option key={sede} value={sede}>{sede}</option>
                                    ))}
                                </select>
                                {errors.sede && <p className="mt-1 text-sm text-red-600">{errors.sede}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="instituto_id" className="block text-sm font-medium text-gray-700">
                                    Instituto
                                </label>
                                <select
                                    id="instituto_id"
                                    value={data.instituto_id}
                                    onChange={(event) => setData('instituto_id', event.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Seleccione un instituto</option>
                                    {institutos.map((instituto) => (
                                        <option key={instituto.id} value={instituto.id}>
                                            {instituto.siglas} — {instituto.nombre}
                                        </option>
                                    ))}
                                </select>
                                {errors.instituto_id && <p className="mt-1 text-sm text-red-600">{errors.instituto_id}</p>}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-5">
                            <Button variant="secondary" as={Link} href={route('carreras.index')}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Guardar cambios'}
                            </Button>
                        </div>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

import Button from '@/Components/Button';

// resources/js/Pages/Carreras/Create.jsx

import React from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const modalidades = ['presencial', 'virtual', 'mixta'];
const sedes = ['Ushuaia', 'Rio Grande', 'Ushuaia/Rio Grande'];

export default function Create({ auth, institutos }) {

    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        modalidad: '',
        sede: '',
        instituto_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('carreras.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Crear Nueva Carrera</h2>}
        >
            <Head title="Crear Carrera" />

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">

                            {flash?.error && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                                    {flash.error}
                                </div>
                            )}

                            <form onSubmit={submit}>

                                {/* NOMBRE */}
                                <div>
                                    <label htmlFor="nombre" className="block font-medium text-sm text-gray-700">Nombre</label>
                                    <input
                                        id="nombre"
                                        type="text"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        className="w-full mt-1 block"
                                    />
                                    {errors.nombre && <div className="text-red-500 text-xs mt-1">{errors.nombre}</div>}
                                </div>

                                {/* MODALIDAD */}
                                <div className="mt-4">
                                    <label htmlFor="modalidad" className="block font-medium text-sm text-gray-700">Modalidad</label>
                                    <select
                                        id="modalidad"
                                        value={data.modalidad}
                                        onChange={(e) => setData('modalidad', e.target.value)}
                                        className="w-full mt-1 block"
                                    >
                                        <option value="">Seleccione una modalidad</option>
                                        {modalidades.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    {errors.modalidad && <div className="text-red-500 text-xs mt-1">{errors.modalidad}</div>}
                                </div>

                                {/* SEDE */}
                                <div className="mt-4">
                                    <label htmlFor="sede" className="block font-medium text-sm text-gray-700">Sede</label>
                                    <select
                                        id="sede"
                                        value={data.sede}
                                        onChange={(e) => setData('sede', e.target.value)}
                                        className="w-full mt-1 block"
                                    >
                                        <option value="">Seleccione una sede</option>
                                        {sedes.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    {errors.sede && <div className="text-red-500 text-xs mt-1">{errors.sede}</div>}
                                </div>

                                {/* INSTITUTO */}
                                <div className="mt-4">
                                    <label htmlFor="instituto_id" className="block font-medium text-sm text-gray-700">Instituto</label>
                                    <select
                                        id="instituto_id"
                                        value={data.instituto_id}
                                        onChange={(e) => setData('instituto_id', e.target.value)}
                                        className="w-full mt-1 block"
                                    >
                                        <option value="">Seleccione un instituto</option>
                                        {institutos.map((instituto) => (
                                            <option key={instituto.id} value={instituto.id}>
                                                {instituto.siglas}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.instituto_id && <div className="text-red-500 text-xs mt-1">{errors.instituto_id}</div>}
                                </div>

                                {/* BOTONES */}
                                <div className="flex items-center justify-end mt-6">
                                    <div className="flex justify-end gap-x-4">
                                        <Button variant="danger"
                                            as={Link}
                                            href={route('carreras.index')}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button variant="primary"
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing ? 'Guardando...' : 'Guardar Carrera'}
                                        </Button>
                                    </div>
                                </div>

                            </form>

                        </div>
                    </div>

        </AuthenticatedLayout>
    );
}
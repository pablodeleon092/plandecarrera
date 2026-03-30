import React from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';

export default function Edit({ institutos, flash }) {
    const { props } = usePage();
    const { user } = props;

    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        dni: user.dni || '',
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        cargo: user.cargo || '',
        instituto_id: user.instituto_id || '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('users.update', user.id)); // Llama al método update
    };

    const coordinador = user.cargo === 'Coordinador de Carrera';

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">
                Usuarios
            </h2>}
        >
            <Head title="Usuarios" />
            {flash?.success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {flash?.success}
                </div>
            )}

            {flash?.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {flash?.error}
                </div>
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 className="text-2xl font-bold mb-4">Editar usuario</h1>

                <form
                    onSubmit={handleSubmit}
                    className="border rounded p-4 bg-white shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {/* Username */}
                    <div>
                        <InputLabel htmlFor="name" value="Username" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            autoComplete="name"
                            isFocused
                            onChange={e => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    {/* Email */}
                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="email"
                            onChange={e => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    {/* DNI */}
                    <div>
                        <InputLabel htmlFor="dni" value="DNI" />
                        <TextInput
                            id="dni"
                            name="dni"
                            value={data.dni}
                            className="mt-1 block w-full"
                            autoComplete="dni"
                            onChange={e => setData('dni', e.target.value)}
                            required
                        />
                        <InputError message={errors.dni} className="mt-2" />
                    </div>

                    {/* Nombre */}
                    <div>
                        <InputLabel htmlFor="nombre" value="Nombre" />
                        <TextInput
                            id="nombre"
                            name="nombre"
                            value={data.nombre}
                            className="mt-1 block w-full"
                            onChange={e => setData('nombre', e.target.value)}
                            required
                        />
                        <InputError message={errors.nombre} className="mt-2" />
                    </div>

                    {/* Apellido */}
                    <div>
                        <InputLabel htmlFor="apellido" value="Apellido" />
                        <TextInput
                            id="apellido"
                            name="apellido"
                            value={data.apellido}
                            className="mt-1 block w-full"
                            onChange={e => setData('apellido', e.target.value)}
                            required
                        />
                        <InputError message={errors.apellido} className="mt-2" />
                    </div>

                    {/* Cargo */}
                    <div>
                        <InputLabel htmlFor="cargo" value="Cargo" />
                        <select
                            id="cargo"
                            name="cargo"
                            value={data.cargo}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            onChange={(e) => setData('cargo', e.target.value)}
                            required
                        >
                            <option value="Administrador">Administrador</option>
                            <option value="Administrativo de Secretaria Academica">Administrativo de Secretaria Academica</option>
                            <option value="Administrativo de instituto">Administrativo de instituto</option>
                            <option value="Coordinador de Carrera">Coordinador de Carrera</option>
                            <option value="Director de instituto">Director de instituto</option>
                            <option value="Coordinador Academico">Coordinador Academico</option>
                            <option value="Consejero">Consejero</option>
                        </select>

                        <InputError message={errors.cargo} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="instituto_id" value="Instituto" />

                        <select
                            id="instituto_id"
                            name="instituto_id"
                            value={data.instituto_id}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            onChange={(e) => setData('instituto_id', e.target.value)}
                        >
                            <option value="">No instituto</option>
                            {institutos.map((instituto) => (
                                <option key={instituto.id} value={instituto.id}>
                                    {instituto.siglas}
                                </option>
                            ))}
                        </select>

                        <InputError message={errors.instituto_id} className="mt-2" />
                    </div>

                    {/* Password */}
                    <div>
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            name="password"
                            type="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            onChange={e => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    {/* Password Confirmation */}
                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Confirmar Password" />
                        <TextInput
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            className="mt-1 block w-full"
                            onChange={e => setData('password_confirmation', e.target.value)}
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    {/* Botón */}
                    <div className="md:col-span-3 flex justify-between mt-4">
                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? 'Guardando...' : 'Actualizar'}
                        </PrimaryButton>

                        {coordinador && (
                            <Link
                                href={route('coordinadores.carreras.edit', user.id)}
                            >
                                <PrimaryButton as="span">
                                    Agregar Carreras
                                </PrimaryButton>
                            </Link>
                        )}


                    </div>
                </form>

                <div className="mt-4">
                    <Link
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            window.history.back();
                        }}
                    >
                        <SecondaryButton>
                            Volver
                        </SecondaryButton>
                    </Link>
                </div>

            </div>
        </AuthenticatedLayout>

    );
}

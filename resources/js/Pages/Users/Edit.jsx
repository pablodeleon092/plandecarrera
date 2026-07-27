import Button from '@/Components/Button';
import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import PasswordInput from '@/Components/PasswordInput';

export default function Edit({ institutos, flash, returnTo = 'index' }) {
    const { props } = usePage();
    const { user } = props;
    const [activeTab, setActiveTab] = useState('details');

    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        dni: user.dni || '',
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        cargo: user.cargo || '',
        instituto_id: user.instituto_id || '',
        return_to: returnTo,
    });

    const {
        data: passwordData,
        setData: setPasswordData,
        patch: patchPassword,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPassword,
    } = useForm({
        password: '',
        password_confirmation: '',
    });

    const returnUrl = returnTo === 'show'
        ? route('users.show', user.id)
        : route('users.index');

    const goBack = () => router.visit(returnUrl);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('users.update', user.id), {
            replace: true,
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        patchPassword(route('users.password.update', user.id), {
            preserveScroll: true,
            onSuccess: () => resetPassword(),
        });
    };

    const handleTabKeyDown = (e) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
            return;
        }

        e.preventDefault();
        const nextTab = ['ArrowRight', 'End'].includes(e.key) ? 'password' : 'details';
        setActiveTab(nextTab);
        requestAnimationFrame(() => document.getElementById(`${nextTab}-tab`)?.focus());
    };

    const coordinador = user.cargo === 'Coordinador de Carrera';

    const isDisabled = data.cargo === "Administrador" || data.cargo === "Administrativo de Secretaria Academica";

    useEffect(() => {
        if (isDisabled) {
            // Si el select se desactiva, reseteamos el valor en el estado de Inertia/React
            setData('instituto_id', ''); 
        }
    }, [isDisabled]);

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

                <div
                    role="tablist"
                    aria-label="Secciones de edición del usuario"
                    className="mb-5 flex gap-6 border-b border-gray-300"
                >
                    <button
                        id="details-tab"
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'details'}
                        aria-controls="details-panel"
                        tabIndex={activeTab === 'details' ? 0 : -1}
                        onClick={() => setActiveTab('details')}
                        onKeyDown={handleTabKeyDown}
                        className={`border-b-2 px-1 pb-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            activeTab === 'details'
                                ? 'border-indigo-600 text-indigo-700'
                                : 'border-transparent text-gray-600 hover:border-gray-400 hover:text-gray-900'
                        }`}
                    >
                        Datos del usuario
                    </button>
                    <button
                        id="password-tab"
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'password'}
                        aria-controls="password-panel"
                        tabIndex={activeTab === 'password' ? 0 : -1}
                        onClick={() => setActiveTab('password')}
                        onKeyDown={handleTabKeyDown}
                        className={`border-b-2 px-1 pb-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            activeTab === 'password'
                                ? 'border-indigo-600 text-indigo-700'
                                : 'border-transparent text-gray-600 hover:border-gray-400 hover:text-gray-900'
                        }`}
                    >
                        Cambiar contraseña
                    </button>
                </div>

                {activeTab === 'details' && (
                    <form
                        id="details-panel"
                        role="tabpanel"
                        aria-labelledby="details-tab"
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
                            disabled = {isDisabled}
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

                    {/* Botón */}
                    <div className="md:col-span-3 flex justify-between mt-4">
                        <Button variant="primary"
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? 'Guardando...' : 'Actualizar'}
                        </Button>

                        {coordinador && (
                            <Link
                                href={route('coordinadores.carreras.edit', user.id)}
                            >
                                <Button variant="primary" as="span">
                                    Agregar Carreras
                                </Button>
                            </Link>
                        )}

                    </div>
                    </form>
                )}

                {activeTab === 'password' && (
                    <form
                        id="password-panel"
                        role="tabpanel"
                        aria-labelledby="password-tab"
                        onSubmit={handlePasswordSubmit}
                        className="max-w-3xl rounded border bg-white p-5 shadow-sm"
                    >
                        <div className="max-w-2xl">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Cambiar contraseña
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-gray-600">
                                Definí una nueva contraseña para este usuario. Su contraseña actual no se puede consultar.
                            </p>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="password" value="Nueva contraseña" />
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={passwordData.password}
                                    className="mt-1"
                                    autoComplete="new-password"
                                    onChange={(e) => setPasswordData('password', e.target.value)}
                                    required
                                />
                                <InputError message={passwordErrors.password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value="Confirmar nueva contraseña"
                                />
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={passwordData.password_confirmation}
                                    className="mt-1"
                                    autoComplete="new-password"
                                    onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                    required
                                />
                                <InputError
                                    message={passwordErrors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={passwordProcessing}
                            >
                                {passwordProcessing ? 'Actualizando...' : 'Cambiar contraseña'}
                            </Button>
                        </div>
                    </form>
                )}

                <div className="mt-4">
                    <Button
                        variant="secondary"
                        onClick={goBack}
                    >
                        Volver
                    </Button>
                </div>

            </div>
        </AuthenticatedLayout>

    );
}

import Button from '@/Components/Button';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { useEffect } from 'react';
import TextInput from '@/Components/TextInput';
import PasswordInput from '@/Components/PasswordInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register({ institutos, pendingUser = {} }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: pendingUser.name ?? '',
        email: pendingUser.email ?? '',
        dni: pendingUser.dni ?? '',
        nombre: pendingUser.nombre ?? '',
        apellido: pendingUser.apellido ?? '',
        cargo: pendingUser.cargo ?? '',
        instituto_id: pendingUser.instituto_id ?? '',
        password: '',
        password_confirmation: '',
    });

    const isDisabled = data.cargo === "Administrador" || data.cargo === "Administrativo de Secretaria Academica";

    const submit = (e) => {
        e.preventDefault();

        post(route('users.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    useEffect(() => {
        if (isDisabled) {
            // Si el select se desactiva, reseteamos el valor en el estado de Inertia/React
            setData('instituto_id', ''); 
        }
    }, [isDisabled]);

    return (

        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Crear Nuevo Usuario</h2>}
        >
            <Head title="Crear Usuario"/>
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                
                <form onSubmit={submit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="mt-4">
                        <InputLabel htmlFor="name" value="Username"/>

                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />

                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="email" value="Email" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="nombre" value="Nombre" />

                        <TextInput
                            id="nombre"
                            type="text"
                            name="nombre"
                            value={data.nombre}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            onChange={(e) => setData('nombre', e.target.value)}
                            required
                        />

                        <InputError message={errors.nombre} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="apellido" value="Apellido" />

                        <TextInput
                            id="apellido"
                            type="text"
                            name="apellido"
                            value={data.apellido}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            onChange={(e) => setData('apellido', e.target.value)}
                            required
                        />

                        <InputError message={errors.apellido} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="dni" value="DNI" />

                        <TextInput
                            id="dni"
                            type="text"
                            name="dni"
                            value={data.dni}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            onChange={(e) => setData('dni', e.target.value)}
                            required
                        />

                        <InputError message={errors.dni} className="mt-2" />
                    </div>


                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="Contraseña" />

                        <PasswordInput
                            id="password"
                            name="password"
                            value={data.password}
                            className="mt-1"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Confirmar contraseña"
                        />

                        <PasswordInput
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                        />

                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="cargo" value="Cargo" />

                        <select
                            id="cargo"
                            name="cargo"
                            value={data.cargo}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            onChange={(e) => setData('cargo', e.target.value)}
                            required
                        >
                            <option value="">-- Selecciona un cargo --</option>
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

                    <div className="mt-4">
                        <InputLabel htmlFor="instituto_id" value="Instituto" />

                        <select
                            disabled = {isDisabled}
                            id="instituto_id"
                            name="instituto_id"
                            value={data.instituto_id}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            onChange={(e) => setData('instituto_id', e.target.value)}
                        >
                            <option value="">-- Selecciona un instituto --</option>
                            {institutos.map((instituto) => (
                                <option key={instituto.id} value={instituto.id}>
                                    {instituto.siglas}
                                </option>
                            ))}
                        </select>

                        <InputError message={errors.instituto_id} className="mt-2" />
                    </div>

                    <div className="mt-4 flex items-center justify-end">
                        <Button variant="primary" className="ms-4" disabled={processing}>
                            Crear usuario
                        </Button>
                    </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

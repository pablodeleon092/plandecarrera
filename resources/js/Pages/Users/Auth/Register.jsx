import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register({ institutos }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        dni: '',
        nombre: '',
        apellido: '',
        cargo: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('users.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Create User" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Name" />

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


                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
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

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}

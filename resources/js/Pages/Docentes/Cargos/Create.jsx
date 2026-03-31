import Button from '@/Components/Button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';

export default function Create({ auth, docente, dedicaciones, flash }) {

    const { data, setData, post, processing, errors } = useForm({
        cargo: '',
        dedicacion_id: '',
        docente_id: docente.id,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('cargos.store', { docente: docente.id }));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Agregar Cargo a {docente.nombre} {docente.apellido}</h2>}
        >
            <Head title="Agregar Cargo" />

            {flash?.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {flash.error}
                </div>
            )}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            {/* Campo oculto con el ID del docente */}
                            <input type="hidden" name="docente_id" value={data.docente_id} />

                            {/* Cargo */}
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
                                    <option value="Titular">Titular</option>
                                    <option value="Asociado">Asociado</option>
                                    <option value="Adjunto">Adjunto</option>
                                    <option value="Jefe de Trabajos Practicos">Jefe de Trabajos Prácticos</option>
                                    <option value="Ayudante de Primera">Ayudante de Primera</option>
                                </select>

                                <InputError message={errors.cargo} className="mt-2" />
                            </div>

                            {/* Dedicaciones */}
                            <div className="mt-4">
                                <InputLabel htmlFor="dedicacion" value="Dedicación" />

                                <select
                                    id="dedicacion"
                                    name="dedicacion_id"
                                    value={data.dedicacion_id}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    onChange={(e) => setData('dedicacion_id', e.target.value)}
                                    required
                                >
                                    <option value="">-- Selecciona una dedicación --</option>
                                    {dedicaciones.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nombre}
                                        </option>
                                    ))}
                                </select>

                                <InputError message={errors.dedicacion_id} className="mt-2" />
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button variant="danger"
                                    as={Link}
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        window.history.back();
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button variant="primary"
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing ? 'Guardando...' : 'Agregar Cargo'}
                                </Button>
                            </div>
                        </form>
                    </div>
        </AuthenticatedLayout>
    );
}
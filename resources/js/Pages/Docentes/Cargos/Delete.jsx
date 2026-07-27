import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function Delete({ auth, docente, cargos = [] }) {
    const { data, setData, delete: destroy, processing } = useForm({
        cargo_ids: [],
    });

    const toggleCargo = (id) => {
        setData(
            'cargo_ids',
            data.cargo_ids.includes(id)
                ? data.cargo_ids.filter((c) => c !== id)
                : [...data.cargo_ids, id]
        );
    };

    const allSelected = cargos.length > 0 && data.cargo_ids.length === cargos.length;
    const toggleAll = () => {
        setData('cargo_ids', allSelected ? [] : cargos.map((c) => c.id));
    };

    const submit = (event) => {
        event.preventDefault();
        if (data.cargo_ids.length === 0) return;
        if (!confirm(
            `¿Eliminar ${data.cargo_ids.length} cargo(s)? También se quitarán sus asignaciones a comisiones. Esta acción no se puede deshacer.`
        )) {
            return;
        }
        destroy(route('docentes.cargos.destroy', docente.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Eliminar cargos de {docente.apellido}, {docente.nombre}
                </h2>
            }
        >
            <Head title="Eliminar cargos" />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-4">
                    <Button
                        variant="secondary"
                        as={Link}
                        href="#"
                        onClick={(event) => {
                            event.preventDefault();
                            window.history.back();
                        }}
                        className="inline-flex items-center gap-2"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver atrás
                    </Button>
                </div>

                <form onSubmit={submit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 rounded-md border-l-4 border-amber-400 bg-amber-50 p-4">
                        <p className="text-sm text-amber-800">
                            Eliminar un cargo también quita sus asignaciones a comisiones. Esta acción no se puede deshacer.
                        </p>
                    </div>

                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase text-gray-500">
                            Seleccioná los cargos a eliminar
                        </h3>
                        {cargos.length > 0 && (
                            <button
                                type="button"
                                onClick={toggleAll}
                                className="text-sm font-medium text-blue-600 hover:underline"
                            >
                                {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                            </button>
                        )}
                    </div>

                    {cargos.length === 0 ? (
                        <p className="py-4 text-center text-gray-500">
                            Este docente no tiene cargos para eliminar.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {cargos.map((cargo) => (
                                <li key={cargo.id}>
                                    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                            checked={data.cargo_ids.includes(cargo.id)}
                                            onChange={() => toggleCargo(cargo.id)}
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-800">{cargo.nombre}</p>
                                            <p className="text-sm text-gray-500">
                                                Dedicación: {cargo.dedicacion ? cargo.dedicacion.nombre : 'N/A'}
                                                {' · '}Horas: {cargo.sum_horas_frente_aula}
                                                {' · '}Materias: {cargo.nro_materias_asig}
                                            </p>
                                        </div>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5">
                        <Button variant="secondary" as={Link} href={route('docentes.show', docente.id)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            type="submit"
                            disabled={processing || data.cargo_ids.length === 0}
                        >
                            {processing
                                ? 'Eliminando...'
                                : `Eliminar cargo(s)${data.cargo_ids.length ? ` (${data.cargo_ids.length})` : ''}`}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

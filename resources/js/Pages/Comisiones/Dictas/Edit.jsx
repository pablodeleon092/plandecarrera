import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';
import DangerButton from '@/Components/Buttons/DangerButton';

export default function EditDicta({ auth, flash, dicta, funcionesAulicas, cargos }) {


    const comision = dicta.comision;
    const docente = dicta.docente

    // Función de ayuda para asegurar que las fechas se muestren correctamente en el input 'date'
    const formatYearDate = (dateString) => {
        if (!dateString) return '';
        // Asume que la cadena es 'YYYY-MM-DD HH:MM:SS' y toma solo la parte de la fecha
        return dateString.substring(0, 10);
    };

    const { data, setData, put, processing, errors } = useForm({
        // Campos que se inicializan con los valores existentes de dicta
        comision_id: comision.id,
        docente_id: docente.id,
        cargo_id: dicta.cargo_id, // Usamos el ID de cargo existente en dicta
        horas_frente_aula: dicta.horas_frente_aula || '',
        modalidad_presencia: dicta.modalidad_presencia,
        ano_inicio: formatYearDate(dicta.ano_inicio),
        año_fin: formatYearDate(dicta.año_fin),
        funcion_aulica_id: dicta.funcion_aulica_id || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // CLAVE: Usar 'put' y la ruta 'update' con el ID del dicta a editar
        put(route('dictas.update', dicta.id), {
            preserveScroll: true,
        });
    };

    // Generar años para el selector de Año Fin si es necesario (asumo que se usa input type="date")
    // Si quisieras un selector de años:
    // const currentYear = new Date().getFullYear();
    // const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

    return (
        <AuthenticatedLayout
            user={auth.user}
            // CLAVE: Referencia correcta a comision.nombre
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                Editar Asignación - Comisión: {comision.nombre}
            </h2>}
        >
            <Head title={`Editar Asignación: ${comision.nombre}`} />

            <div className="py-8">
                <div className="container mx-auto px-4 max-w-lg bg-white rounded-lg shadow-xl p-8">

                    {/* Mensajes Flash */}
                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {flash.error}
                        </div>
                    )}

                    <div className="mb-6 border-b pb-4">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800">Editar Asignación Docente</h3>
                        <p className="text-lg mb-2">
                            Docente: <strong>{docente.nombre} {docente.apellido} (Legajo: {docente.legajo})</strong>
                        </p>
                        <p className="text-sm text-gray-600">Comisión: {comision.codigo} - {comision.nombre}</p>
                        <p className="text-sm text-gray-600">Horas Totales de la Comisión: {comision.horas_totales}</p>
                        <p className="text-sm text-gray-600">Horas de Practica: {comision.horas_practicas}</p>
                        <p className="text-sm text-gray-600">Horas Totales de Teoria: {comision.horas_teoricas}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Selector de Cargo (Usamos la lista de cargos del docente, asumiendo que viene en la prop 'cargos' o 'docente.cargos') */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="cargo_id">Cargo</label>
                            <select
                                id="cargo_id"
                                value={data.cargo_id}
                                onChange={e => setData('cargo_id', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            >
                                <option value="">-- Seleccione un cargo --</option>
                                {/* Asumo que cargos es un array de cargos disponibles para la edición */}
                                {cargos && cargos.map(cargo => (
                                    <option key={cargo.id} value={cargo.id}>{cargo.nombre}</option>
                                ))}
                            </select>
                            {errors.cargo_id && <p className="text-red-500 text-sm mt-1">{errors.cargo_id}</p>}
                        </div>

                        {/* Horas frente al aula */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="horas_frente_aula">Horas frente al aula</label>
                            <input
                                id="horas_frente_aula"
                                type="number"
                                min="0"
                                value={data.horas_frente_aula}
                                onChange={e => setData('horas_frente_aula', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                            {errors.horas_frente_aula && <p className="text-red-500 text-sm mt-1">{errors.horas_frente_aula}</p>}
                        </div>

                        {/* Modalidad Presencia */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="modalidad_presencia">Modalidad de presencia</label>
                            <select
                                id="modalidad_presencia"
                                value={data.modalidad_presencia}
                                onChange={e => setData('modalidad_presencia', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            >
                                <option value="presencial">Presencial</option>
                                <option value="virtual">Virtual</option>
                                <option value="mixta">Mixta</option>
                            </select>
                            {errors.modalidad_presencia && <p className="text-red-500 text-sm mt-1">{errors.modalidad_presencia}</p>}
                        </div>

                        {/* Año Inicio */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2" htmlFor="ano_inicio">Fecha Inicio</label>
                                <input
                                    id="ano_inicio"
                                    type="date"
                                    value={data.ano_inicio}
                                    onChange={e => setData('ano_inicio', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                                {errors.ano_inicio && <p className="text-red-500 text-sm mt-1">{errors.ano_inicio}</p>}
                            </div>

                            {/* Año Fin (puede ser nulo) */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2" htmlFor="año_fin">Fecha Fin (Opcional)</label>
                                <input
                                    id="año_fin"
                                    type="date"
                                    value={data.año_fin}
                                    onChange={e => setData('año_fin', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                {errors.año_fin && <p className="text-red-500 text-sm mt-1">{errors.año_fin}</p>}
                            </div>
                        </div>

                        {/* Función Aúlica */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="funcion_aulica_id">Función Aúlica</label>
                            <select
                                id="funcion_aulica_id"
                                value={data.funcion_aulica_id}
                                onChange={e => setData('funcion_aulica_id', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">-- Ninguna --</option>
                                {funcionesAulicas.map(funcion => (
                                    <option key={funcion.id} value={funcion.id}>{funcion.nombre}</option>
                                ))}
                            </select>
                            {errors.funcion_aulica_id && <p className="text-red-500 text-sm mt-1">{errors.funcion_aulica_id}</p>}
                        </div>

                        <div className="flex justify-end items-center pt-4 space-x-4">
                            <DangerButton
                                as={Link}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.history.back();
                                }}
                            >
                                Cancelar
                            </DangerButton>
                            <PrimaryButton
                                type="submit"
                                disabled={processing}
                            >
                                {processing ? 'Actualizando...' : 'Actualizar Asignación'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
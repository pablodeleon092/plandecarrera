import Button from '@/Components/Button';
import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CreateDicta({ auth, comision, periodo, flash, docente, funcionesAulicas }) {
    const { data, setData, post, errors } = useForm({
        comision_id: comision.id,
        docente_id: docente.id,
        cargo_id: '',
        horas_frente_aula: '',
        funcion_aulica_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('dictas.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Comisión: {comision.nombre}</h2>}
        >
            <Head title={`Comisión: ${comision.nombre}`} />

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

            <div className="py-8">
                <div className="container mx-auto px-4 max-w-lg bg-white rounded-lg shadow-lg p-6">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold mb-6">Asignar Docente a la Comisión</h3>
                        <p className="mb-4">Docente seleccionado: <strong>{docente.nombre} {docente.apellido} (Legajo: {docente.legajo})</strong></p>
                        <p>Horas Teoricas: {comision.horas_teoricas}</p>
                        <p>Horas Practicas: {comision.horas_practicas}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Seleccionar Cargo */}
                        <div>
                            <label htmlFor="cargo_id" className="block text-gray-700 font-semibold mb-2">Cargo</label>
                            <select
                                id="cargo_id"
                                value={data.cargo_id}
                                onChange={e => setData('cargo_id', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                                required
                            >
                                <option value="">-- Seleccione un cargo --</option>
                                {docente.cargos.map(cargo => (
                                    <option key={cargo.id} value={cargo.id}>{cargo.nombre} {cargo.dedicacion ? `(${cargo.dedicacion.nombre})` : ''}</option>
                                ))}
                            </select>
                            {errors.cargo_id && <p className="text-red-500 text-sm mt-1">{errors.cargo_id}</p>}
                        </div>

                        {/* Horas frente al aula */}
                        <div>
                            <label htmlFor="horas_frente_aula" className="block text-gray-700 font-semibold mb-2">Horas frente al aula</label>
                            <input
                                id="horas_frente_aula"
                                type="number"
                                min="0"
                                value={data.horas_frente_aula}
                                onChange={e => setData('horas_frente_aula', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                                required
                            />
                            {errors.horas_frente_aula && <p className="text-red-500 text-sm mt-1">{errors.horas_frente_aula}</p>}
                        </div>

                        {/* Modalidad Presencia */}
                        <div>
                            <label htmlFor="modalidad_presencia" className="block text-gray-700 font-semibold mb-2">Modalidad de presencia</label>
                            <input
                                id="modalidad_presencia"
                                type="text"
                                value={comision.modalidad}
                                className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 capitalize cursor-not-allowed"
                                readOnly
                            />
                            <p className="text-sm text-gray-500 mt-1">Definida por la modalidad de la comisión.</p>
                        </div>

                        {/* Año Inicio */}
                        <div>
                            <label htmlFor="ano_inicio" className="block text-gray-700 font-semibold mb-2">Año Inicio</label>
                            <input
                                id="ano_inicio"
                                type="date"
                                value={periodo.inicio}
                                className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                                readOnly
                            />
                        </div>

                        {/* Año Fin */}
                        <div>
                            <label htmlFor="ano_fin" className="block text-gray-700 font-semibold mb-2">Año Fin</label>
                            <input
                                id="ano_fin"
                                type="date"
                                value={periodo.fin}
                                className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                                readOnly
                            />
                            <p className="text-sm text-gray-500 mt-1">Período definido por el régimen y cuatrimestre de la comisión.</p>
                        </div>

                        {/* Función Aúlica */}
                        <div>
                            <label htmlFor="funcion_aulica_id" className="block text-gray-700 font-semibold mb-2">Función Aúlica</label>
                            <select
                                id="funcion_aulica_id"
                                value={data.funcion_aulica_id}
                                onChange={e => setData('funcion_aulica_id', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">-- Ninguna --</option>
                                {funcionesAulicas.map(funcion => (
                                    <option key={funcion.id} value={funcion.id}>{funcion.nombre}</option>
                                ))}
                            </select>
                            {errors.funcion_aulica_id && <p className="text-red-500 text-sm mt-1">{errors.funcion_aulica_id}</p>}
                        </div>

                        <div className="flex justify-between items-center">
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
                            >
                                Guardar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

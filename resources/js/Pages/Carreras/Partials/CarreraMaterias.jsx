import React, { useState } from "react";
import DataTable from "@/Components/DataTable";
import Button from '@/Components/Button';
import { useForm, Link, router } from "@inertiajs/react";

export default function CarreraMaterias({ carrera, planes }) {
    const [planSeleccionado, setPlanSeleccionado] = useState(null);
    const [mostrandoBaja, setMostrandoBaja] = useState(false);

    // Formulario para la baja
    const { data, setData, patch, processing, errors, reset } = useForm({
        anio_fin: new Date().toISOString().split('T')[0],
    });

    const confirmarBaja = (e) => {
        e.preventDefault();
        patch(route('planes.desactivar', planSeleccionado.id), {
            onSuccess: () => {
                setMostrandoBaja(false);
                setPlanSeleccionado(null);
                reset();
            },
        });
    };

    const columnasPlanes = [
        {
            key: "anio_comienzo",
            label: "Fecha Inicio",
            render: (p) => new Date(p.anio_comienzo).toLocaleDateString('es-AR')
        },
        {
            key: "anio_fin",
            label: "Fecha Fin",
            render: (p) => p.anio_fin ? new Date(p.anio_fin).toLocaleDateString('es-AR') : <span className="text-green-600 font-semibold">Vigente</span>
        },
        {
            key: "acciones",
            label: "Acciones",
            render: (p) => (
                <Button variant="info" onClick={() => { setPlanSeleccionado(p); setMostrandoBaja(false); }}>
                    Ver Materias
                </Button>
            ),
        },

    ];

    // Columnas para la tabla de Materias (la que ya tenías)
    const columnasMaterias = [
        { key: "nombre", label: "Nombre" },
        { key: "codigo", label: "Código" },
        { key: "regimen", label: "Régimen" },
        { 
            key: "anio", 
            label: "Año",
            render: (m) => m.pivot?.anio || 'N/A' 
        },
        { key: "cuatrimestre", label: "Cuatrimestre" },
        {
            key: "acciones",
            label: "Acciones",
            render: (m) => (
                <a href={route("materias.show", m.id)} className="text-blue-600 hover:underline">
                    Ver Detalle
                </a>
            ),
        },
    ];

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar esta materia?')) {
            router.delete(route('planes.destroy', id));
        }
    };

    return (
        <div className="space-y-10">
            {/* SECCIÓN 1: Listado de Planes */}
            <div>
                <h3 className="text-2xl font-bold mb-5">Planes de Estudio: {carrera.nombre}</h3>

                <Button
                variant="primary"
                className="mb-5"
                as={Link}
                href={route('planes.create', carrera.id)}
                >
                Agregar Plan de Estudio
                </Button>
                <DataTable 
                    columns={columnasPlanes} 
                    data={planes} 
                    emptyMessage="No hay planes registrados." 
                    onDelete={(plan) => handleDelete(plan.id)}
                    />
            </div>

            <hr className="border-gray-200" />

            {/* SECCIÓN 2: Detalle y Formulario de Baja */}
            {planSeleccionado && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm animate-in fade-in zoom-in-95 duration-300">

                    {/* Encabezado con botones de acción */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h4 className="text-xl font-semibold text-gray-800">
                                Detalle del Plan: {new Date(planSeleccionado.anio_comienzo).getFullYear()}
                            </h4>
                            <p className="text-sm text-gray-500">
                                {planSeleccionado.anio_fin ? "Este plan ya ha sido finalizado." : "Este plan se encuentra actualmente vigente."}
                            </p>
                        </div>
                        <div className="flex gap-x-2">
                            {!mostrandoBaja && (
                                <Button variant="danger" onClick={() => setMostrandoBaja(true)}>
                                    Dar de Baja Plan
                                </Button>
                            )}
                            <button type="button" onClick={() => { setPlanSeleccionado(null); setMostrandoBaja(false); }} className="px-3 py-2 text-gray-400 hover:text-gray-600 text-sm">
                                Cerrar
                            </button>
                        </div>
                    </div>

                    {/* VISTA DE FORMULARIO DE BAJA */}
                    {mostrandoBaja ? (
                        <div className="bg-white p-6 rounded-md border-l-4 border-red-500 shadow-inner mb-6">
                            <h5 className="text-lg font-bold text-red-700 mb-2">Finalizar Vigencia del Plan</h5>
                            <p className="text-sm text-gray-600 mb-4">
                                Selecciona la fecha en la que este plan dejará de tener validez para la carrera.
                            </p>

                            <form onSubmit={confirmarBaja} className="flex flex-col sm:flex-row items-end gap-4">
                                <div className="flex-1">
                                    <label htmlFor="anio_fin" className="block text-sm font-medium text-gray-700 mb-1">Fecha de finalización</label>
                                    <input
                                        id="anio_fin"
                                        type="date"
                                        value={data.anio_fin}
                                        onChange={e => setData('anio_fin', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                        required
                                    />
                                    {errors.anio_fin && <p className="text-red-500 text-xs mt-1">{errors.anio_fin}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="secondary" onClick={() => setMostrandoBaja(false)}>Cancelar</Button>
                                    <Button variant="danger" type="submit" disabled={processing}>Confirmar Baja</Button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* TABLA DE MATERIAS (Solo se muestra si no estamos en modo "baja") */
                        <DataTable
                            columns={columnasMaterias}
                            data={planSeleccionado.materias || []}
                            emptyMessage="Este plan no tiene materias asignadas."
                        />
                    )}
                </div>
            )}
        </div>
    );
}

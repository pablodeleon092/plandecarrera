import Button from '@/Components/Button';
import TableFilters from '@/Components/TableFilters';
import React, { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function EditPlan({ auth, plan, carrera, materiasEnPlan, materiasDisponibles, flash }) {
    const [enPlan, setEnPlan] = useState(materiasEnPlan || []);
    const [disponibles, setDisponibles] = useState(materiasDisponibles || []);
    const [searchDisponibles, setSearchDisponibles] = useState('');
    const { setData, put, processing } = useForm({
        materias: (materiasEnPlan || []).map((materia) => materia.id),
    });

    const disponiblesFiltradas = useMemo(() => {
        const query = searchDisponibles.toLowerCase().trim();

        if (!query) return disponibles;

        return disponibles.filter((materia) => {
            const nombre = materia.nombre?.toLowerCase() || '';
            const codigo = materia.codigo?.toLowerCase() || '';

            return nombre.includes(query) || codigo.includes(query);
        });
    }, [disponibles, searchDisponibles]);

    const anioPlan = String(plan.anio_comienzo || '').slice(0, 4);
    const identidadPlan = plan.codigo && plan.nombre
        ? `${plan.codigo} — ${plan.nombre}`
        : `Plan ${anioPlan || 'sin año'}`;
    const tituloPlan = `Editar plan ${identidadPlan}`;

    useEffect(() => {
        setData('materias', enPlan.map((materia) => materia.id));
    }, [enPlan]);

    const onDragEnd = ({ source, destination }) => {
        if (!destination) return;

        const sourceList = source.droppableId === 'enPlan'
            ? enPlan
            : disponiblesFiltradas;
        const moved = sourceList[source.index];

        if (!moved) return;

        if (source.droppableId === destination.droppableId) {
            if (source.droppableId === 'disponibles') return;

            const nextEnPlan = enPlan.filter((materia) => materia.id !== moved.id);
            nextEnPlan.splice(destination.index, 0, moved);
            setEnPlan(nextEnPlan);
            return;
        }

        if (source.droppableId === 'enPlan') {
            setEnPlan((current) => current.filter((materia) => materia.id !== moved.id));
            setDisponibles((current) => [...current, moved]);
        } else {
            setDisponibles((current) => current.filter((materia) => materia.id !== moved.id));
            setEnPlan((current) => {
                const nextEnPlan = current.filter((materia) => materia.id !== moved.id);
                nextEnPlan.splice(destination.index, 0, moved);
                return nextEnPlan;
            });
            setSearchDisponibles('');
        }
    };

    const submit = (event) => {
        event.preventDefault();
        put(route('planes.update', plan.id), {
            preserveScroll: true,
        });
    };

    const renderMaterias = (materias, prefix) => materias.map((materia, index) => (
        <Draggable key={materia.id} draggableId={`${prefix}-${materia.id}`} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-2 rounded-md border border-gray-100 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm"
                    style={provided.draggableProps.style}
                >
                    {materia.nombre}
                </div>
            )}
        </Draggable>
    ));

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{tituloPlan}</h2>}
        >
            <Head title={tituloPlan} />

            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <Button
                    variant="secondary"
                    as={Link}
                    href={route('carreras.show', carrera.id)}
                    className="mb-5 inline-flex items-center gap-2"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver a la carrera
                </Button>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 border-b border-gray-200 pb-4">
                        <h1 className="text-2xl font-semibold text-gray-900">{tituloPlan}</h1>
                        <p className="mt-1 text-sm font-medium text-gray-700">Carrera: {carrera.nombre}</p>
                        <p className="mt-1 text-sm text-gray-500">
                            Arrastrá las materias entre las listas para actualizar este plan de estudio.
                        </p>
                    </div>

                    {flash?.success && (
                        <div className="mb-5 rounded-md border border-green-400 bg-green-100 px-4 py-3 text-green-700">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <h2 className="mb-3 font-semibold text-gray-900">Materias en el plan</h2>
                                    <Droppable droppableId="enPlan">
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="min-h-56 max-h-[60vh] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4"
                                            >
                                                {enPlan.length === 0 && <p className="text-sm text-gray-500">No hay materias en el plan.</p>}
                                                {renderMaterias(enPlan, 'enPlan')}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>

                                <div>
                                    <h2 className="mb-3 font-semibold text-gray-900">Materias disponibles</h2>
                                    <div className="mb-3 rounded-lg border border-gray-200 bg-white p-3">
                                        <TableFilters
                                            filters={[{
                                                key: 'search',
                                                label: 'Buscar',
                                                type: 'text',
                                                value: searchDisponibles,
                                                placeholder: 'Buscar por nombre o código',
                                            }]}
                                            onChange={(_, value) => setSearchDisponibles(value)}
                                            className="md:grid-cols-1"
                                        />
                                    </div>
                                    <Droppable droppableId="disponibles">
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="min-h-56 max-h-[60vh] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4"
                                            >
                                                {disponibles.length === 0 && <p className="text-sm text-gray-500">No hay materias disponibles.</p>}
                                                {disponibles.length > 0 && disponiblesFiltradas.length === 0 && (
                                                    <p className="text-sm text-gray-500">No hay materias que coincidan con la búsqueda.</p>
                                                )}
                                                {renderMaterias(disponiblesFiltradas, 'disponibles')}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            </div>
                        </DragDropContext>

                        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5">
                            <Button variant="secondary" as={Link} href={route('carreras.show', carrera.id)}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Guardar plan'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import Button from '@/Components/Button';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function EditPlan({ auth, plan, carrera, materiasEnPlan, materiasDisponibles, flash }) {
    const [enPlan, setEnPlan] = useState(materiasEnPlan || []);
    const [disponibles, setDisponibles] = useState(materiasDisponibles || []);
    const { setData, put, processing } = useForm({
        materias: (materiasEnPlan || []).map((materia) => materia.id),
    });

    useEffect(() => {
        setData('materias', enPlan.map((materia) => materia.id));
    }, [enPlan]);

    const onDragEnd = ({ source, destination }) => {
        if (!destination) return;

        if (source.droppableId === destination.droppableId) {
            const list = source.droppableId === 'enPlan' ? [...enPlan] : [...disponibles];
            const [moved] = list.splice(source.index, 1);
            list.splice(destination.index, 0, moved);

            if (source.droppableId === 'enPlan') setEnPlan(list);
            else setDisponibles(list);
            return;
        }

        const sourceList = source.droppableId === 'enPlan' ? [...enPlan] : [...disponibles];
        const destinationList = destination.droppableId === 'enPlan' ? [...enPlan] : [...disponibles];
        const [moved] = sourceList.splice(source.index, 1);
        destinationList.splice(destination.index, 0, moved);

        if (source.droppableId === 'enPlan') {
            setEnPlan(sourceList);
            setDisponibles(destinationList);
        } else {
            setEnPlan(destinationList);
            setDisponibles(sourceList);
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
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Editar Plan de Estudio</h2>}
        >
            <Head title={`Editar Plan - ${carrera.nombre}`} />

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
                        <h1 className="text-2xl font-semibold text-gray-900">Editar plan de {carrera.nombre}</h1>
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
                                    <Droppable droppableId="disponibles">
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="min-h-56 max-h-[60vh] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4"
                                            >
                                                {disponibles.length === 0 && <p className="text-sm text-gray-500">No hay materias disponibles.</p>}
                                                {renderMaterias(disponibles, 'disponibles')}
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

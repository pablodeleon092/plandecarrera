import Button from '@/Components/Button';
import InputError from '@/Components/InputError';
import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Nota: Se asume que recibes las props: auth, coordinador, carrerasAsignadas, carrerasRestantes, flash.
export default function AsignarCarrerasCoordinador({
    auth,
    coordinador,
    carrerasAsignadas,
    carrerasRestantes,
    flash,
    creationMode = false,
}) {

    // 1. RENOMBRAR ESTADOS
    const [carrerasCoordinador, setCarrerasCoordinador] = useState(carrerasAsignadas || []); // Carreras ya asignadas
    const [carrerasDisponibles, setCarrerasDisponibles] = useState(carrerasRestantes || []); // Carreras no asignadas

    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const COORD_ID = 'carrerasCoordinador';

        const sourceState = source.droppableId === COORD_ID ? carrerasCoordinador : carrerasDisponibles;

        // Reorden dentro de la misma lista: una sola copia, sacar y reinsertar sobre ella.
        if (source.droppableId === destination.droppableId) {
            const list = Array.from(sourceState);
            const [moved] = list.splice(source.index, 1);
            list.splice(destination.index, 0, moved);

            if (source.droppableId === COORD_ID) setCarrerasCoordinador(list);
            else setCarrerasDisponibles(list);
            return;
        }

        // Movimiento entre listas distintas: se conserva la lógica actual.
        const destState = destination.droppableId === COORD_ID ? carrerasCoordinador : carrerasDisponibles;
        const sourceList = Array.from(sourceState);
        const destList = Array.from(destState);

        const [moved] = sourceList.splice(source.index, 1);
        destList.splice(destination.index, 0, moved);

        if (source.droppableId === COORD_ID) {
            setCarrerasCoordinador(sourceList);
            setCarrerasDisponibles(destList);
        } else {
            setCarrerasCoordinador(destList);
            setCarrerasDisponibles(sourceList);
        }
    };

    // 2. ADAPTAR useForm A LA NUEVA LÓGICA (Coordinador y Carreras)
    const {
        setData,
        post,
        patch,
        processing,
        errors,
    } = useForm({
        // El backend espera un array de IDs de las carreras asignadas
        carreras_ids: carrerasCoordinador.map(c => c.id),
    });

    // Sincronizar form data con el estado de las carreras asignadas
    useEffect(() => {
        setData('carreras_ids', carrerasCoordinador.map(c => c.id));
    }, [carrerasCoordinador]);

    const guardarCambios = (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (creationMode) {
            post(route('users.coordinator-carreras.store'), {
                preserveScroll: true,
            });
            return;
        }

        if (!coordinador || !coordinador.id) {
            alert('No se encontró el coordinador para guardar la asignación.');
            return;
        }

        // 3. CAMBIAR RUTA PUT: PUT a la ruta de asignación del coordinador (ej: /coordinadores/{id}/carreras)
        // Se asume que tienes una ruta para actualizar las asignaciones de un coordinador.
        patch(route('coordinadores.carreras.update', coordinador.id), {
            // Opciones de Inertia van en el tercer argumento
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onSuccess: () => console.log('Carreras asignadas actualizadas con éxito.'),
            onError: (errors) => console.error('Error al guardar:', errors),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Asignar Carreras a Coordinador</h2>}
        >
            <Head title={`Asignar Carreras - ${coordinador.nombre} ${coordinador.apellido}`} />


                <h2 className="text-2xl font-semibold mb-4 mt-4">Asignar Carreras a {coordinador.nombre} {coordinador.apellido}</h2>
                {flash?.success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {flash?.success}
                    </div>
                )}

                <DragDropContext onDragEnd={onDragEnd}>
                    <table className="w-full table-auto border-collapse mb-4">
                        <thead>
                            <tr>
                                {/* 4. ACTUALIZAR CABECERAS */}
                                <th className="px-4 py-2 text-left">Carreras asignadas al coordinador</th>
                                <th className="px-4 py-2 text-left">Carreras no asignadas (Disponibles)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {/* LISTA DE ASIGNADAS (carrerasCoordinador) */}
                                <td className="align-top w-1/2 px-4 py-2">
                                    <Droppable droppableId="carrerasCoordinador">
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className="border p-4 min-h-[200px] bg-white rounded shadow-sm">
                                                {carrerasCoordinador.length === 0 && <p className="text-sm text-gray-500">Arrastra carreras aquí para asignarlas.</p>}
                                                {carrerasCoordinador.map((carrera, index) => (
                                                    <Draggable key={carrera.id} draggableId={`coord-${carrera.id}`} index={index}>
                                                        {(provided) => (
                                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="p-2 mb-2 bg-blue-100 border-l-4 border-blue-500 rounded cursor-pointer" style={provided.draggableProps.style}>
                                                                {carrera.nombre}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </td>

                                {/* LISTA DE NO ASIGNADAS (carrerasDisponibles) */}
                                <td className="align-top w-1/2 px-4 py-2">
                                    <Droppable droppableId="carrerasDisponibles">
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className="border p-4 min-h-[200px] bg-gray-50 rounded shadow-sm">
                                                {carrerasDisponibles.length === 0 && <p className="text-sm text-gray-500">Todas las carreras han sido asignadas.</p>}
                                                {carrerasDisponibles.map((carrera, index) => (
                                                    <Draggable key={carrera.id} draggableId={`disp-${carrera.id}`} index={index}>
                                                        {(provided) => (
                                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="p-2 mb-2 bg-white rounded border cursor-pointer" style={provided.draggableProps.style}>
                                                                {carrera.nombre}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </DragDropContext>

                <InputError message={errors.carreras_ids} className="mt-2" />

                <div className={`flex items-center mt-6 ${creationMode ? 'justify-between' : 'justify-end'}`}>
                    {creationMode && (
                        <Button
                            as={Link}
                            href={route('users.create')}
                            variant="secondary"
                        >
                            Volver atrás
                        </Button>
                    )}

                    {/* Botón Guardar Cambios */}
                    <Button variant="primary"
                        onClick={guardarCambios}
                        disabled={processing}
                    >
                        {processing ? 'Guardando...' : 'Guardar asignación'}
                    </Button>
                </div>

        </AuthenticatedLayout>
    );
}

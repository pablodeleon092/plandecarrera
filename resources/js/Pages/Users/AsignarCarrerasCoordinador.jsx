import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import DangerButton from '@/Components/Buttons/DangerButton';

// Nota: Se asume que recibes las props: auth, coordinador, carrerasAsignadas, carrerasRestantes, flash.
export default function AsignarCarrerasCoordinador({ auth, coordinador, carrerasAsignadas, carrerasRestantes, flash }) {

    // 1. RENOMBRAR ESTADOS
    const [carrerasCoordinador, setCarrerasCoordinador] = useState(carrerasAsignadas || []); // Carreras ya asignadas
    const [carrerasDisponibles, setCarrerasDisponibles] = useState(carrerasRestantes || []); // Carreras no asignadas

    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        // IDs para los droppables
        const COORD_ID = 'carrerasCoordinador';
        const DISP_ID = 'carrerasDisponibles';

        // Determinar listas fuente y destino
        const sourceState = source.droppableId === COORD_ID ? carrerasCoordinador : carrerasDisponibles;
        const destState = destination.droppableId === COORD_ID ? carrerasCoordinador : carrerasDisponibles;

        const sourceList = Array.from(sourceState);
        const destList = Array.from(destState);

        // Mover el elemento
        const [moved] = sourceList.splice(source.index, 1);
        destList.splice(destination.index, 0, moved);

        // Actualizar estados
        if (source.droppableId === destination.droppableId) {
            // Reorden dentro de la misma lista
            if (source.droppableId === COORD_ID) setCarrerasCoordinador(sourceList);
            else setCarrerasDisponibles(sourceList);
        } else {
            // Mover entre listas
            if (source.droppableId === COORD_ID) {
                setCarrerasCoordinador(sourceList);
                setCarrerasDisponibles(destList);
            } else {
                setCarrerasCoordinador(destList);
                setCarrerasDisponibles(sourceList);
            }
        }
    };

    // 2. ADAPTAR useForm A LA NUEVA LÓGICA (Coordinador y Carreras)
    const { setData, put, processing: isPutting } = useForm({
        // El backend espera un array de IDs de las carreras asignadas
        carreras_ids: carrerasCoordinador.map(c => c.id),
    });

    // Sincronizar form data con el estado de las carreras asignadas
    useEffect(() => {
        setData('carreras_ids', carrerasCoordinador.map(c => c.id));
    }, [carrerasCoordinador]);

    const guardarCambios = (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!coordinador || !coordinador.id) {
            alert('No se encontró el coordinador para guardar la asignación.');
            return;
        }

        // 3. CAMBIAR RUTA PUT: PUT a la ruta de asignación del coordinador (ej: /coordinadores/{id}/carreras)
        // Se asume que tienes una ruta para actualizar las asignaciones de un coordinador.
        router.patch(route('coordinadores.carreras.update', coordinador.id), {
            carreras_ids: carrerasCoordinador.map(c => c.id)
        }, {
            // Opciones de Inertia van en el tercer argumento
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => console.log('Carreras asignadas actualizadas con éxito.'),
            onError: (errors) => console.error('Error al guardar:', errors),
        });
    };

    // La lógica de desactivar carrera no aplica aquí, se elimina o se reemplaza por otra acción de coordinador si es necesario
    // Dejo la estructura del código de desactivación por si quieres adaptar una acción de 'coordinador'
    const [isDeactivating, setIsDeactivating] = useState(false);
    const desactivarCoordinador = (e) => {
        e.preventDefault();
        // ... Lógica para desactivar el coordinador si aplica ...
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

                <div className="flex justify-end items-center mt-6">
                    {/* Botón de desactivación, si aplica a un coordinador */}
                    <DangerButton
                        onClick={desactivarCoordinador}
                        disabled={isPutting || isDeactivating}
                        className="mr-4" // Añadir margen derecho
                    >
                        Desactivar Coordinador
                    </DangerButton>

                    {/* Botón Guardar Cambios */}
                    <PrimaryButton
                        onClick={guardarCambios}
                        disabled={isPutting || isDeactivating}
                    >
                        {isPutting ? 'Guardando...' : 'Guardar asignación'}
                    </PrimaryButton>
                </div>

        </AuthenticatedLayout>
    );
}
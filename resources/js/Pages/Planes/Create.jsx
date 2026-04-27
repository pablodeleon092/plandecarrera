import React, { useState, useMemo, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Button from '@/Components/Button';
import TableFilters from "@/Components/TableFilters";
import DataTable from "@/Components/DataTable";

export default function Create({ auth, carrera, materiasEnPlanAnterior, materiasDisponibles, flash, filters: initialFilters = {} }) {
    // Si no hay materias previas, empezamos en el paso 2
    const [step, setStep] = useState(materiasEnPlanAnterior.length > 0 ? 1 : 2);
    const [filters, setFilters] = useState({
            search: initialFilters.search || "",
        });
    
    const [enPlan, setEnPlan] = useState([]);
    const [disponibles, setDisponibles] = useState(materiasDisponibles || []);
    const [seleccionadasPrevias, setSeleccionadasPrevias] = useState(
        materiasEnPlanAnterior.map(m => m.id)
    );

    const { data, setData, post, processing, errors } = useForm({
        carrera_id: carrera.id,
        anio_comienzo: new Date().toISOString().split('T')[0],
        materias: [],
    });

    // Sincronizar materias con el form al cambiar las listas
    useEffect(() => {
        setData('materias', enPlan.map(m => m.id));
    }, [enPlan]);

    // Lógica para avanzar al paso 2 filtrando las seleccionadas
    const irAlPasoDos = () => {
        const conservadas = materiasEnPlanAnterior.filter(m => seleccionadasPrevias.includes(m.id));
        const noConservadas = materiasEnPlanAnterior.filter(m => !seleccionadasPrevias.includes(m.id));
        
        setEnPlan(conservadas);
        // Las que no quiso conservar se suman a las disponibles para agregar después
        setDisponibles([...materiasDisponibles, ...noConservadas]);
        setStep(2);
    };

    const handleCheckboxChange = (id) => {
        setSeleccionadasPrevias(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const filterConfig = [
        {
            key: "search",
            label: "Buscar",
            type: "text",
            value: filters.search,
            placeholder: "Buscar por nombre, codigo",
        },
    ];

    const materiasFiltradas = useMemo(() => {
        const query = filters.search.toLowerCase().trim();
        if (!query) return [];

        return materiasDisponibles.filter((d) => {
            const nombre = d.nombre?.toLowerCase() || "";
            const codigo = d.codigo?.toLowerCase() || "";
            return nombre.includes(query) || codigo.includes(query);
        });
    }, [filters.search, materiasDisponibles]);    

    const columns = [
        { key: "nombre", label: "Nombre"},
        { key: "codigo", label: "Codigo" }, // Corregido de 'cargo' a 'codigo'
        { 
            key: "acciones", 
            label: "Acciones", 
            render: (materia) => (
                <Button variant="danger" 
                    onClick={() => {
                        setEnPlan(prev => prev.filter(m => m.id !== materia.id));
                        setDisponibles(prev => [...prev, materia]);
                    }}
                >
                    Quitar
                </Button>
            )
        }
    ];

    const agregarMateriaAlPlan = (materia) => {
    // 1. Evitar duplicados
    if (enPlan.some(m => m.id === materia.id)) return;

    // 2. Agregar a la lista del plan
    setEnPlan(prev => [...prev, materia]);

    // 3. Quitar de la lista de disponibles (para que no aparezca en el buscador)
    setDisponibles(prev => prev.filter(m => m.id !== materia.id));
    
    // 4. Limpiar el buscador (opcional, reseteando el filtro)
    setFilters(prev => ({ ...prev, search: "" }));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold text-gray-800">Crear Nuevo Plan - {carrera.nombre}</h2>}
        >
            <Head title="Nuevo Plan"/>

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                
                {/* PASO 1: Conservar Materias */}
                {step === 1 && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium mb-4">Paso 1: Materias del plan anterior</h3>
                        <p className="text-gray-600 mb-6">Selecciona las materias que deseas mantener en el nuevo plan:</p>
                        
                        <div className="space-y-2 max-h-96 overflow-y-auto border p-4 rounded mb-6">
                            {materiasEnPlanAnterior.map(materia => (
                                <label key={materia.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-indigo-600"
                                        checked={seleccionadasPrevias.includes(materia.id)}
                                        onChange={() => handleCheckboxChange(materia.id)}
                                    />
                                    <span>{materia.nombre}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <Button variant="primary"  onClick={irAlPasoDos}>
                                Continuar a configuración de materias
                            </Button>
                        </div>
                    </div>
                )}

                {/* PASO 2: Drag and Drop */}
                {step === 2 && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium">Paso 2: Organizar materias del nuevo plan</h3>
                            {materiasEnPlanAnterior.length > 0 && (
                                <Button variant="secondary" onClick={() => setStep(1)}>
                                    Volver atrás
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Año de Comienzo</label>
                                <input 
                                    type="date" 
                                    value={data.anio_comienzo}
                                    onChange={e => setData('anio_comienzo', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300"
                                />
                            </div>
                        </div>
                    {/* LISTADO PRINCIPAL - Ahora muestra lo que el usuario va armando */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Materias en el nuevo plan</h3>
                        {/* Usamos 'enPlan' en lugar de 'materiasEnPlanAnterior' para que se actualice en vivo */}
                        <DataTable 
                            columns={columns} 
                            data={enPlan} 
                            emptyMessage="Aún no has agregado materias al plan." 
                        />
                    </div>

                    {/* BUSCADOR Y AGREGADO */}
                    <div className="mt-8">
                        <h4 className="text-lg font-semibold mb-2">Buscar y Agregar Materia</h4>
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <TableFilters filters={filterConfig} onChange={handleFilterChange} />
                        </div>

                        {materiasFiltradas.length > 0 && (
                            <ul className="border border-gray-200 rounded-md shadow-sm bg-white max-h-60 overflow-y-auto">
                                {materiasFiltradas.map((materia) => (
                                    <li
                                        key={materia.id}
                                        className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b last:border-0"
                                        // CAMBIO AQUÍ: Llamamos a nuestra nueva función
                                        onClick={() => agregarMateriaAlPlan(materia)}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{materia.nombre}</span>
                                            <span className="text-xs text-gray-500">Código: {materia.codigo || "—"}</span>
                                        </div>
                                        <span className="text-blue-600 font-bold text-xl">+</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                        <div className="mt-8 flex justify-end">
                            <Button variant="primary" 
                                onClick={() => post(route('planes.store'))} 
                                disabled={processing || enPlan.length === 0}
                            >
                                {processing ? 'Guardando...' : 'Crear Plan Definitivo'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
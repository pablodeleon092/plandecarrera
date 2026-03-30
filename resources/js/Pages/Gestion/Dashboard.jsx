import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import Materias from './Partials/Materias';
import PaginatorButtons from '@/Components/Buttons/PaginatorButtons';
import DocentesList from './Partials/DocentesList';

export default function Dashboard({ user, institutos, materias, docentes, selectedInstitutoId: initialInstitutoId, selectedCarreraId: initialCarreraId, currentView: initialView }) {
    // 1. STATE 
    const [selectedInstitutoId, setSelectedInstitutoId] = useState(initialInstitutoId || (institutos.length > 0 ? institutos[0].id : null));
    const [selectedCarreraId, setSelectedCarreraId] = useState(initialCarreraId || 'all');
    const [currentView, setCurrentView] = useState(initialView || 'materias');

    // ----------------------------------------------------------------------
    // 2. LÓGICA DE DATOS
    // ----------------------------------------------------------------------

    // A. Obtener el Instituto Seleccionado
    const selectedInstituto = useMemo(() => {
        return institutos.find(inst => inst.id === selectedInstitutoId);
    }, [selectedInstitutoId, institutos]);


    // B. Carreras Disponibles
    const carrerasDisponibles = useMemo(() => {
        if (!selectedInstituto || !selectedInstituto.carreras) {
            return [];
        }
        return selectedInstituto.carreras;
    }, [selectedInstituto]);


    // ----------------------------------------------------------------------
    // 3. HANDLERS DE CAMBIOS (Disparan la petición al Backend)
    // ----------------------------------------------------------------------

    const handleInstitutoChange = (e) => {
        const newInstitutoId = parseInt(e.target.value);

        // 1. Actualizar el estado local
        setSelectedInstitutoId(newInstitutoId);

        // 2. Disparar la petición a Laravel con los nuevos filtros
        router.get(route('dashboard'), {
            instituto_id: newInstitutoId,
            carrera_id: 'all', // Resetear la carrera al cambiar de instituto
            view: currentView
        }, {
            // Esto evita que se recargue toda la página, solo actualiza las props.
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleCarreraChange = (e) => {
        const newCarreraId = e.target.value; // Puede ser 'all' (string) o un ID

        // 1. Actualizar el estado local
        setSelectedCarreraId(newCarreraId);

        // 2. Disparar la petición a Laravel, conservando el instituto actual
        router.get(route('dashboard'), {
            instituto_id: selectedInstitutoId,
            carrera_id: newCarreraId,
            view: currentView
        }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleTabChange = (view) => {
        setCurrentView(view);

        router.get(route('dashboard'), {
            instituto_id: selectedInstitutoId,
            carrera_id: selectedCarreraId,
            view: view
        }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };




    // ----------------------------------------------------------------------
    // 4. RENDERING
    // ----------------------------------------------------------------------

    // Opciones para el selector de Carreras
    const carreraOptions = [
        { id: 'all', nombre: 'Todas las Carreras' },
        ...carrerasDisponibles.map(c => ({ id: c.id, nombre: c.nombre }))
    ];


    return (
        <AuthenticatedLayout
            user={user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard de Gestión
                </h2>
            }
        >
            <Head title="Dashboard" />

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">

                        {/* SELECTORES DE FILTRO (Permanecen en el Dashboard) */}
                        <div className="flex flex-col md:flex-row gap-6 mb-8">

                            {/* Selector de Instituto */}
                            <div className="w-full md:w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="instituto_select">
                                    Seleccionar Instituto
                                </label>
                                <select
                                    id="instituto_select"
                                    value={selectedInstitutoId || ''}
                                    onChange={handleInstitutoChange}
                                    disabled={institutos.length <= 1}
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full"
                                >
                                    {institutos.map(inst => (
                                        <option key={inst.id} value={inst.id}>
                                            {inst.nombre}
                                        </option>
                                    ))}
                                </select>
                                {institutos.length <= 1 && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        Solo tiene acceso a su instituto.
                                    </p>
                                )}
                            </div>

                            {/* Selector de Carreras */}
                            <div className="w-full md:w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="carrera_select">
                                    Seleccionar Carrera
                                </label>
                                <select
                                    id="carrera_select"
                                    value={selectedCarreraId}
                                    onChange={handleCarreraChange}
                                    disabled={carrerasDisponibles.length === 0}
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full"
                                >
                                    {carreraOptions.map(c => (
                                        // Aseguramos que el ID se pase como string si es numérico
                                        <option key={c.id} value={c.id.toString()}>
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>


                        {/* TABS DE NAVEGACIÓN */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button
                                    onClick={() => handleTabChange('materias')}
                                    className={`
                                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                        ${currentView === 'materias'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                    `}
                                >
                                    Materias
                                </button>

                                {/* Mostrar pestaña Docentes según rol (o para todos si es la lógica deseada) */}
                                <button
                                    onClick={() => handleTabChange('docentes')}
                                    className={`
                                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                        ${currentView === 'docentes'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                    `}
                                >
                                    Docentes
                                </button>
                            </nav>
                        </div>

                        {/* CONTENIDO DE LA PESTAÑA */}
                        {currentView === 'materias' && (
                            <Materias materias={materias} />
                        )}

                        {currentView === 'docentes' && (
                            <DocentesList docentes={docentes} />
                        )}

                    </div>
                    <PaginatorButtons
                        meta={currentView === 'materias' ? materias.meta : docentes.meta}
                        paginator={currentView === 'materias' ? materias : docentes}
                        routeName={'dashboard'}
                        routeParams={{
                            instituto_id: selectedInstitutoId,
                            carrera_id: selectedCarreraId,
                            view: currentView
                        }}
                    />

        </AuthenticatedLayout>
    );
}
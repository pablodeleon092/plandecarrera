import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import Button from '@/Components/Button';
import Materias from './Partials/Materias';
import PaginatorButtons from '@/Components/Buttons/PaginatorButtons';
import DocentesList from './Partials/DocentesList';

export default function Dashboard({ user, institutos, materias, docentes, selectedInstitutoId: initialInstitutoId, selectedCarreraId: initialCarreraId, currentView: initialView }) {
    // 1. STATE 
    const [selectedInstitutoId, setSelectedInstitutoId] = useState(initialInstitutoId || (institutos.length > 0 ? institutos[0].id : null));
    const [selectedCarreraId, setSelectedCarreraId] = useState(initialCarreraId || 'all');
    const [selectedCargo, setSelectedCargo] = useState(user.cargo || '');
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
            selected_carrera: 'all', // Resetear la carrera al cambiar de instituto
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
            selected_carrera: newCarreraId,
            view: currentView
        }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };


    // ----------------------------------------------------------------------
    // 4.  RENDERING
    // ----------------------------------------------------------------------

    // Opciones para el selector de Carreras
    const carreraOptions = [
        { id: 'all', nombre: 'Todas las Carreras' },
        ...carrerasDisponibles.map(c => ({ id: c.id, nombre: c.nombre }))
    ];

    const CARGOS_DISPONIBLES = [
        'Administrador',
        'Consejero',
        'Secretaría académica',
        'Director de instituto',
        'Coordinador Academico',
        'Administrativo de instituto',
        'Coordinador de Carrera'
    ];

    const handleRoleOverride = (e) => {
            const cargo = selectedCargo;
            router.get(route('dashboard'), {
                // Pasamos el cargo elegido al backend
                view: cargo, 
                instituto_id: selectedInstitutoId,
                selected_carrera: selectedCarreraId,
            }, {
                preserveScroll: true,
                replace: true,
            });
        };

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Seleccionador de Dashboard
                    </h2>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                {/* SELECTORES DE FILTRO */}
                <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                
                    {/* SELECTOR DE MODO ADMINISTRADOR */}
                    {user.cargo === 'Administrador' && (
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admin_role_select">
                                Vista de Rol
                            </label>
                            <select
                                id="admin_role_select"
                                valu = {selectedCargo}
                                onChange={(e) => setSelectedCargo(e.target.value)}
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full text-sm"
                            >
                                {CARGOS_DISPONIBLES.map(cargo => (
                                    <option key={cargo} value={cargo}>
                                        {cargo}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Selector de Instituto */}
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="instituto_select">
                            Seleccionar Instituto
                        </label>
                        <select
                            id="instituto_select"
                            value={selectedInstitutoId || ''}
                            onChange={handleInstitutoChange}
                            disabled={institutos.length <= 1}
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full text-sm"
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
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="carrera_select">
                            Seleccionar Carrera
                        </label>
                        <select
                            id="carrera_select"
                            value={selectedCarreraId}
                            onChange={handleCarreraChange}
                            disabled={carrerasDisponibles.length === 0}
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full text-sm"
                        >
                            {carreraOptions.map(c => (
                                <option key={c.id} value={c.id.toString()}>
                                    {c.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                </div>
                <Button variant="primary"
                onClick={handleRoleOverride}
                >
                Cargar Vista
                </Button>
            </div>
        </AuthenticatedLayout>
    );
}
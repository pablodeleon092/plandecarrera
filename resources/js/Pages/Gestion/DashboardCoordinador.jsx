import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import KPICard from '@/Components/Dashboard/KPICard';
import StatusIndicator from '@/Components/Dashboard/StatusIndicator';
import DataTable from '@/Components/DataTable';
export default function DashboardCoordinador({
    user,
    carreras, // Lista para el select
    selectedCarreraId,
    mapaCurricular, // Info de getResumenMapaCurricular
}) {
    const [currentTab, setCurrentTab] = useState('resumen');

    // Manejador para cambiar de carrera y disparar el lazy load
    const handleCarreraChange = (id) => {
        // Usamos el path actual para evitar errores de nombres de rutas en Ziggy
        router.get(window.location.pathname, 
            { selected_carrera: id }, 
            { 
                only: ['mapaCurricular', 'selectedCarreraId'], 
                preserveState: true,
                preserveScroll: true 
            }
        );
    };

    const tabs = [
        { id: 'resumen', label: 'Mapa Curricular' },
        { id: 'docentes', label: 'Mis Docentes' },
        { id: 'alertas', label: 'Alertas', badge: 0 },
    ];

    const columns = [
        { 
            label: 'Cuat.', 
            key: 'cuatrimestre', 
            render: (materia) => (
                <span className="text-gray-600 font-medium">
                    {materia.cuatrimestre ? `${materia.cuatrimestre}º` : '-'}
                </span>
            )
        },
        { 
            label: 'Materia', 
            key: 'nombre',
            className: 'font-semibold text-gray-900' 
        },
        { 
            label: 'Comisiones y Docentes', 
            key: 'comisiones',
            render: (materia) => (
                <div className="space-y-3 my-1">
                    {materia.comisiones.length > 0 ? (
                        materia.comisiones.map((com, idx) => (
                            <div key={idx} className="flex flex-col border-l-2 border-indigo-100 pl-3">
                                <span className="font-medium text-indigo-700 text-xs">
                                    {com.nombre}
                                </span>
                                <span className="text-[11px] text-gray-500 italic">
                                    {com.docentes && com.docentes.length > 0 
                                        ? com.docentes.join(', ') 
                                        : '⚠️ Sin docente'}
                                </span>
                            </div>
                        ))
                    ) : (
                        <span className="text-red-400 italic text-xs">Sin comisiones</span>
                    )}
                </div>
            )
        },
        { 
            label: 'Estado', 
            key: 'estado',
            className: 'text-right',
            render: (materia) => (
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                    materia.estado === 'Completo' ? 'bg-green-100 text-green-800' :
                    materia.estado === 'Cobertura Parcial' ? 'bg-orange-100 text-orange-800' :
                    materia.estado === 'Sin Docente' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {materia.estado}
                </span>
            )
        }
    ];


    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Dashboard Coordinador de Carrera
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">Gestión académica por carrera</p>
                    </div>
                    {/* SELECTOR DE CARRERA */}
                    <div className="w-64">
                        <select
                            // Forzamos a string para que coincida con los values de las options
                            value={selectedCarreraId !== null ? String(selectedCarreraId) : ''} 
                            onChange={(e) => handleCarreraChange(e.target.value)}
                            className="block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        >
                            <option value="" disabled>Seleccionar Carrera...</option>
                            {carreras.map((c) => (
                                <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Coordinador" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* KPI CARDS - PLACEHOLDERS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <KPICard title="Total Materias" value="--" subtitle="Cargando..." status="neutral" />
                        <KPICard title="Docentes Asignados" value="--" subtitle="Cargando..." status="neutral" />
                        <KPICard title="Comisiones" value="--" subtitle="Cargando..." status="neutral" />
                        <KPICard title="Estado Plan" value="--" subtitle="Plan Vigente" status="neutral" />
                    </div>

                    {/* TABS */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setCurrentTab(tab.id)}
                                    className={`
                                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                                        ${currentTab === tab.id
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* TAB: RESUMEN (MAPA CURRICULAR) */}
                    {currentTab === 'resumen' && (
                        <div className="mt-6">
                            <DataTable 
                                columns={columns} 
                                data={mapaCurricular?.materias || []}
                                hover={true}
                                emptyMessage="No hay materias cargadas para esta carrera."
                                actions={false} 
                                disableScroll={false} // Permitimos scroll si la pantalla es chica
                            />
                        </div>
                    )}

                    {/* OTROS TABS (VACÍOS POR AHORA) */}
                    {currentTab === 'docentes' && <div className="bg-white p-6 rounded-lg shadow">Próximamente: Lista de docentes por carrera</div>}
                    {currentTab === 'alertas' && <div className="bg-white p-6 rounded-lg shadow">Próximamente: Alertas de falta de cobertura</div>}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
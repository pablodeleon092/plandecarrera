import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import KPICard from '@/Components/Dashboard/KPICard';
import { 
    ExclamationTriangleIcon, 
    ClockIcon, 
    CheckBadgeIcon 
} from '@heroicons/react/24/solid'

import DataTable from '@/Components/DataTable';
export default function DashboardCoordinador({
    user,
    carreras, // Lista para el select
    selectedCarreraId,
    mapaCurricular, // Info de getResumenMapaCurricular
    coberturaPorAño,
    equipoDocenteCarrera,
    cargaHorariaPlan,
    kpis,
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
        { id: 'coberturaPorAño', label: 'Cobertura Docentes por Año' },
        { id: 'equipoDocenteCarrera', label: 'Equipo Docente', badge: 0 },
        { id: 'cargaHorariaPlan', label: 'Carga Horaria' },
    ];

    const columnsResumen = [
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

    const columnsDocentes = [
        { 
            label: 'Docente', 
            key: 'nombre',
            className: 'font-bold text-gray-900' 
        },
        { 
            label: 'Modalidad', 
            key: 'modalidad_desempeño',
            render: (docente) => (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    {docente.modalidad_desempeño || 'No definida'}
                </span>
            )
        },
        { 
            label: 'Cargos y Carga Horaria', 
            key: 'cargos',
            render: (docente) => (
                <div className="flex flex-col gap-2 my-1">
                    {docente.cargos.length > 0 ? (
                        docente.cargos.map((cargo, idx) => (
                            <div key={idx} className="text-xs bg-gray-50 border border-gray-100 p-2 rounded">
                                <div className="font-semibold text-gray-700">{cargo.nombre}</div>
                                <div className="text-gray-500 flex gap-3 mt-1">
                                    <span>📚 Materias: {cargo.nro_materias_asig}</span>
                                    <span>⏰ Horas Aula: {cargo.sum_horas_frente_aula}h</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <span className="text-gray-400 italic text-xs">Sin cargos registrados</span>
                    )}
                </div>
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

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* KPI Cobertura */}
                <KPICard
                    title="Cobertura de Comisiones"
                    value={`${kpis?.cobertura_equipo}%`}
                    // Ahora podemos mostrar el desglose real (ej: "18 de 20")
                    subtitle={`${kpis?.comisiones_completas} de ${kpis?.total_comisiones} comisiones cubiertas`}
                    icon={<CheckBadgeIcon className="w-6 h-6 text-green-600" />}
                    color="green"
                />

                {/* KPI Ratio Horas */}
                <KPICard
                    title="Balance Teórico/Práctico"
                    value={`${kpis?.ratio_teoria}% / ${kpis?.ratio_practica}%`}
                    subtitle="Distribución de carga horaria"
                    icon={<ClockIcon className="w-6 h-6 text-blue-600" />}
                    color="blue"
                />

                {/* KPI Riesgo */}
                <KPICard
                    title="Riesgo de Continuidad"
                    value={kpis?.materias_riesgo}
                    subtitle="Materias con docente único"
                    icon={<ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />}
                    color={kpis?.materias_riesgo > 0 ? "orange" : "green"}
                />
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
                                columns={columnsResumen} 
                                data={mapaCurricular?.materias || []}
                                hover={true}
                                emptyMessage="No hay materias cargadas para esta carrera."
                                actions={false} 
                                disableScroll={false} // Permitimos scroll si la pantalla es chica
                            />
                        </div>
                    )}

                    {currentTab === 'coberturaPorAño' && (
                        <div className="space-y-8">
                            {Object.entries(coberturaPorAño.años).map(([año, materias]) => (
                                <div key={año} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    {/* Cabecera del Año */}
                                    <div className="bg-indigo-600 px-6 py-3">
                                        <h3 className="text-white font-bold text-lg">{año}º Año</h3>
                                    </div>

                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {materias.map((materia) => (
                                            <div key={materia.id} className="border rounded-lg p-4 bg-gray-50">
                                                <h4 className="font-bold text-gray-800 border-b pb-2 mb-3">
                                                    {materia.nombre}
                                                    <span className="text-xs font-normal text-gray-500 ml-2">
                                                        ({materia.cuatrimestre}º Cuat.)
                                                    </span>
                                                </h4>

                                                <div className="space-y-4">
                                                    {materia.comisiones.map((com, cIdx) => (
                                                        <div 
                                                            key={cIdx} 
                                                            className={`p-2 rounded border shadow-sm transition-colors ${
                                                                com.es_valida 
                                                                ? 'bg-white border-gray-100' 
                                                                : 'bg-red-50 border-red-300' // Resalta solo la comisión incompleta
                                                            }`}
                                                        >
                                                            <p className="text-xs font-bold text-indigo-600 uppercase mb-1">
                                                                {com.nombre}
                                                            </p>
                                                            <ul className="space-y-2">
                                                                {com.docentes.length > 0 ? (
                                                                    com.docentes.map((doc, dIdx) => (
                                                                        <li key={dIdx} className="flex justify-between items-center text-sm">
                                                                            <span className="text-gray-700">{doc.nombre_completo}</span>
                                                                            <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                                                                                {doc.cargo}
                                                                            </span>
                                                                        </li>
                                                                    ))
                                                                ) : (
                                                                    <li className="text-xs italic text-red-400">Sin docentes asignados</li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                    {materia.comisiones.length === 0 && (
                                                        <p className="text-xs italic text-gray-400">Sin comisiones creadas</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {currentTab === 'equipoDocenteCarrera' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800">Cuerpo Docente de la Carrera</h3>
                                <span className="text-sm text-gray-500">
                                    Total: {equipoDocenteCarrera?.docentes?.length || 0} docentes
                                </span>
                            </div>
                            
                            <DataTable 
                                columns={columnsDocentes} 
                                data={equipoDocenteCarrera?.docentes || []}
                                hover={true}
                                emptyMessage="No se encontraron docentes vinculados a esta carrera."
                                actions={false}
                                disableScroll={false}
                            />
                        </div>
                    )}
                    {currentTab === 'cargaHorariaPlan' && (
                        <div className="space-y-10">
                            {Object.entries(cargaHorariaPlan.años).map(([año, materias]) => (
                                <div key={año} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                                    <div className="bg-indigo-600 px-6 py-3">
                                        <h3 className="text-white font-bold text-lg">{año}º Año</h3>
                                    </div>

                                    <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-8">
                                        {materias.map((materia) => (
                                            <div key={materia.id} className={`border-l-4 rounded-r-lg p-5 shadow-sm ${materia.horas_ok ? 'border-green-500 bg-green-50/30' : 'border-amber-500 bg-amber-50/30'}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-lg leading-tight">{materia.nombre}</h4>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Cuatrimestre: {materia.cuatrimestre}º</p>
                                                    </div>
                                                    {materia.horas_ok ? 
                                                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg> : 
                                                        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                    }
                                                </div>

                                                <div className="space-y-4">
                                                    {materia.comisiones.map((com, cIdx) => (
                                                        <div key={cIdx} className="bg-white border border-gray-200 rounded-lg p-4">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-sm font-bold text-slate-700">{com.nombre}</span>
                                                                <span className={`text-xs font-bold px-2 py-1 rounded ${com.es_valida ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                    {com.horas_asignadas_real} / {com.horas_totales_requeridas} hs
                                                                </span>
                                                            </div>

                                                            {/* Barra de Progreso de Horas */}
                                                            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                                                                <div 
                                                                    className={`h-2.5 rounded-full transition-all ${com.es_valida ? 'bg-green-500' : 'bg-amber-500'}`} 
                                                                    style={{ width: `${Math.min((com.horas_asignadas_real / com.horas_totales_requeridas) * 100, 100)}%` }}
                                                                ></div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                                                                <div className="flex justify-between border-b border-gray-50 pb-1">
                                                                    <span>Teóricas:</span>
                                                                    <span className="font-medium text-gray-700">{com.horas_teoricas}h</span>
                                                                </div>
                                                                <div className="flex justify-between border-b border-gray-50 pb-1">
                                                                    <span>Prácticas:</span>
                                                                    <span className="font-medium text-gray-700">{com.horas_practicas}h</span>
                                                                </div>
                                                            </div>

                                                            {!com.es_valida && com.deficit > 0 && (
                                                                <p className="mt-2 text-[10px] text-red-600 font-semibold italic">
                                                                    * Faltan cubrir {com.deficit} horas frente al aula.
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
        </AuthenticatedLayout>
    );
}
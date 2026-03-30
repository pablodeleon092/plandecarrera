import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function DashboardAdministrativo({
    user,
    instituto,
    datosIncompletos,
    comisionesActuales,
    docentesActivos,
    tareasPendientes,
    cambiosRecientes,
    kpis,
    currentYear,
    currentSemester,
    // Nuevos datos del backend
    materiasCompartidas = { total: 0, porcentaje: 0, materias: [] },
    docentesMultiCarrera = { total: 0, docentes: [] },
    conflictosHorarios = { total: 0, conflictos: [] },
    totalCarreras = 0,
    visionGeneral = { eficiencia: { solo_una_carrera: 0, multi_carrera: 0 }, topMaterias: [] },
}) {
    const [activeTab, setActiveTab] = useState('vision');

    const tabs = [
        { id: 'vision', label: 'Visión General' },
        { id: 'transversales', label: 'Materias Transversales' },
        { id: 'docentes', label: 'Docentes y Carga' },
        { id: 'comisiones', label: 'Comisiones' },
    ];

    // Calcular porcentajes para el donut chart
    const totalDocentes = kpis?.docentes_activos?.total || 1;
    const multiCarreraCount = docentesMultiCarrera?.total || 0;
    const soloUnaCarreraCount = totalDocentes - multiCarreraCount;
    const multiCarreraPct = Math.round((multiCarreraCount / totalDocentes) * 100);
    const soloUnaPct = 100 - multiCarreraPct;

    // SVG Donut
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const multiCarreraOffset = circumference * (1 - multiCarreraPct / 100);

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Dashboard Administrativo
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {instituto?.nombre} - {currentYear} - Cuatrimestre {currentSemester}
                    </p>
                </div>
            }
        >
            <Head title="Dashboard Administrativo" />

                    {/* KPIs Row - 4 tarjetas */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* % Materias Compartidas */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                % Materias Compartidas
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {materiasCompartidas.porcentaje}%
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Del total de oferta académica</p>
                        </div>

                        {/* Docentes Multi-Carrera */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                Docentes Multi-Carrera
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {docentesMultiCarrera.total}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Dictan en 2 o más carreras</p>
                        </div>

                        {/* Conflictos Detectados */}
                        <div className={`rounded-xl shadow-sm border p-5 ${conflictosHorarios.total > 0
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-white border-gray-100'
                            }`}>
                            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${conflictosHorarios.total > 0 ? 'text-amber-600' : 'text-gray-500'
                                }`}>
                                Conflictos Detectados
                            </p>
                            <p className={`text-3xl font-bold ${conflictosHorarios.total > 0 ? 'text-amber-600' : 'text-gray-900'
                                }`}>
                                {conflictosHorarios.total}
                            </p>
                            <p className={`text-xs mt-1 ${conflictosHorarios.total > 0 ? 'text-amber-500' : 'text-gray-400'
                                }`}>
                                {conflictosHorarios.total > 0 ? 'Superposiciones horarias' : 'Sin conflictos'}
                            </p>
                        </div>

                        {/* Total Carreras */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                Total Carreras
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {totalCarreras}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">En el instituto</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="border-b border-gray-100">
                            <nav className="flex px-6 gap-6">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-6">
                            {/* TAB: Visión General */}
                            {activeTab === 'vision' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Donut Chart: Eficiencia Docente */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Eficiencia Docente</h3>
                                        <p className="text-xs text-gray-500 text-center mb-4">Distribución de Planta Docente</p>
                                        <div className="flex items-center justify-center gap-8">
                                            <div className="relative">
                                                <svg width="160" height="160" viewBox="0 0 160 160">
                                                    <circle
                                                        cx="80" cy="80" r={radius}
                                                        fill="none"
                                                        stroke="#e5e7eb"
                                                        strokeWidth="24"
                                                    />
                                                    <circle
                                                        cx="80" cy="80" r={radius}
                                                        fill="none"
                                                        stroke="#6366f1"
                                                        strokeWidth="24"
                                                        strokeDasharray={circumference}
                                                        strokeDashoffset={multiCarreraOffset}
                                                        strokeLinecap="round"
                                                        transform="rotate(-90 80 80)"
                                                    />
                                                    <text x="80" y="75" textAnchor="middle" className="text-sm" fill="#374151" fontSize="14" fontWeight="600">
                                                        {multiCarreraPct}%
                                                    </text>
                                                    <text x="80" y="92" textAnchor="middle" fill="#9ca3af" fontSize="10">
                                                        Multi
                                                    </text>
                                                </svg>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                                                    <span className="text-xs text-gray-600">Solo 1 Carrera</span>
                                                    <span className="text-xs font-semibold text-gray-800 ml-2">{soloUnaPct}%</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                                    <span className="text-xs text-gray-600">Multi-Carrera</span>
                                                    <span className="text-xs font-semibold text-gray-800 ml-2">{multiCarreraPct}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Estado de Alertas */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Estado de Alertas</h3>
                                        {conflictosHorarios.total > 0 ? (
                                            <>
                                                <p className="text-xs text-indigo-500 mb-4">Conflictos de horarios detectados en el ciclo actual.</p>
                                                <div className="bg-red-50 border-l-4 border-transparent rounded-lg p-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl"></span>
                                                        <div>
                                                            <p className="text-lg font-bold text-red-700">{conflictosHorarios.total} Conflictos</p>
                                                            <p className="text-xs text-red-500">Requieren revisión manual</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-xs text-gray-500 mb-4">Sin conflictos detectados en el ciclo actual.</p>
                                                <div className="bg-green-50 border-l-4 border-transparent rounded-lg p-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl"></span>
                                                        <div>
                                                            <p className="text-lg font-bold text-green-700">Sin Conflictos</p>
                                                            <p className="text-xs text-green-500">Todo en orden</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        <p className="text-xs text-gray-400 mt-4">
                                            Última actualización: {new Date().toLocaleDateString('es-AR')}
                                        </p>
                                    </div>

                                    {/* Top Materias Más Compartidas */}
                                    <div className="lg:col-span-2 bg-gray-50 rounded-xl p-6">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Materias Más Compartidas</h3>
                                        {visionGeneral.topMaterias.length === 0 ? (
                                            <p className="text-xs text-gray-400 text-center py-4">No hay materias compartidas entre carreras</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {visionGeneral.topMaterias.map((materia, idx) => (
                                                    <div key={idx}>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-sm font-medium text-gray-800">{materia.codigo || materia.nombre}</span>
                                                            <span className="text-xs text-gray-500">{materia.total_carreras} carreras</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-indigo-500 h-2 rounded-full"
                                                                style={{ width: `${Math.min(100, (materia.total_carreras / totalCarreras) * 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-1">{materia.carreras?.join(', ')}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB: Materias Transversales */}
                            {activeTab === 'transversales' && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-700">Materias Transversales</h3>
                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                                            {materiasCompartidas.total} Materias compartidas
                                        </span>
                                    </div>
                                    {materiasCompartidas.materias.length === 0 ? (
                                        <p className="text-gray-400 text-center py-8 text-sm">No hay materias compartidas entre carreras</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-100">
                                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 pr-4">Materia</th>
                                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 pr-4">Código</th>
                                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">Compartida entre (Carreras)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {materiasCompartidas.materias.map((materia, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50 transition">
                                                            <td className="py-3 pr-4 font-medium text-gray-900">{materia.nombre}</td>
                                                            <td className="py-3 pr-4">
                                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono">{materia.codigo}</span>
                                                            </td>
                                                            <td className="py-3">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {materia.carreras?.map((carrera, i) => (
                                                                        <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                                                            {carrera}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB: Docentes y Carga */}
                            {activeTab === 'docentes' && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-700">Docentes Multi-Carrera</h3>
                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                                            {docentesMultiCarrera.total} Docentes detectados
                                        </span>
                                    </div>
                                    {docentesMultiCarrera.docentes.length === 0 ? (
                                        <p className="text-gray-400 text-center py-8 text-sm">No hay docentes asignados a múltiples carreras</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-100">
                                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 pr-4">Docente</th>
                                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 pr-4">Legajo</th>
                                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">Carreras involucradas</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {docentesMultiCarrera.docentes.map((docente) => (
                                                        <tr key={docente.id} className="hover:bg-gray-50 transition">
                                                            <td className="py-3 pr-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                        {docente.iniciales || docente.nombre_completo?.split(', ').map(p => p[0]).join('')}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">{docente.nombre_completo}</p>
                                                                        {docente.email && <p className="text-xs text-gray-400">{docente.email}</p>}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 pr-4 text-indigo-600 font-mono text-xs">{docente.legajo}</td>
                                                            <td className="py-3">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {docente.carreras?.map((carrera, i) => (
                                                                        <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                                                            {carrera}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB: Comisiones */}
                            {activeTab === 'comisiones' && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-700">
                                            Comisiones del Cuatrimestre {currentSemester} — {currentYear}
                                        </h3>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                            {comisionesActuales.total} comisiones
                                        </span>
                                    </div>
                                    {comisionesActuales.total === 0 ? (
                                        <p className="text-gray-400 text-center py-8 text-sm">No hay comisiones para el período actual</p>
                                    ) : (
                                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                            {comisionesActuales.comisiones.map((comision) => (
                                                <div key={comision.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{comision.materia}</p>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {comision.nombre} — {comision.turno} ({comision.modalidad})
                                                            </p>
                                                            <div className="mt-2 space-y-1">
                                                                {comision.docentes.length === 0 ? (
                                                                    <span className="text-xs text-red-500">Sin docentes asignados</span>
                                                                ) : (
                                                                    comision.docentes.slice(0, 3).map((doc, idx) => (
                                                                        <p key={idx} className="text-xs text-gray-600">
                                                                            • {doc.nombre} — <span className="text-gray-400">{doc.cargo}</span>
                                                                        </p>
                                                                    ))
                                                                )}
                                                                {comision.docentes.length > 3 && (
                                                                    <p className="text-xs text-gray-400">... y {comision.docentes.length - 3} más</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Link
                                                            href={route('comisiones.show', comision.id)}
                                                            className="ml-4 text-xs text-indigo-600 hover:text-indigo-900 font-medium"
                                                        >
                                                            Ver
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Grid: datos operativos del Dashboard actual */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Datos Incompletos */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-800"> Datos Incompletos de Docentes</h3>
                                <span className="text-xs text-red-600 font-medium">{datosIncompletos.total} docentes</span>
                            </div>
                            <div className="p-5">
                                {datosIncompletos.total === 0 ? (
                                    <p className="text-gray-400 text-center py-4 text-sm"> Todos los docentes tienen datos completos</p>
                                ) : (
                                    <div className="space-y-2 max-h-72 overflow-y-auto">
                                        {datosIncompletos.docentes.map((docente) => (
                                            <div key={docente.id} className="border-l-4 border-transparent bg-red-50 p-3 rounded">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{docente.nombre_completo}</p>
                                                        <p className="text-xs text-gray-500">Legajo: {docente.legajo}</p>
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {docente.campos_faltantes.map((campo, idx) => (
                                                                <span key={idx} className="text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded">
                                                                    Falta: {campo}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <Link href={route('docentes.edit', docente.id)} className="ml-3 text-xs text-indigo-600 hover:text-indigo-900 font-medium">
                                                        Editar
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tareas Pendientes */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-800"> Tareas Pendientes</h3>
                                <span className="text-xs text-yellow-600 font-medium">{tareasPendientes.total} tareas</span>
                            </div>
                            <div className="p-5">
                                {tareasPendientes.total === 0 ? (
                                    <p className="text-gray-400 text-center py-4 text-sm"> No hay tareas pendientes</p>
                                ) : (
                                    <div className="space-y-2 max-h-72 overflow-y-auto">
                                        {tareasPendientes.tareas.map((tarea, idx) => (
                                            <div key={idx} className="border-l-4 border-transparent bg-yellow-50 p-3 rounded">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{tarea.nombre}</p>
                                                        {tarea.codigo && <p className="text-xs text-gray-500">Código: {tarea.codigo}</p>}
                                                        <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-0.5 rounded mt-1 inline-block">
                                                            {tarea.tipo}
                                                        </span>
                                                    </div>
                                                    {tarea.tipo === 'Sin comisión creada' && (
                                                        <Link
                                                            href={route('comisiones.create', { materia_id: tarea.id })}
                                                            className="ml-3 text-xs text-indigo-600 hover:text-indigo-900 font-medium"
                                                        >
                                                            Crear
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Historial de Cambios Recientes - Full Width */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-800"> Historial de Cambios Recientes</h3>
                                <span className="text-xs text-gray-500">Últimas {cambiosRecientes.total} modificaciones</span>
                            </div>
                            <div className="p-5">
                                {cambiosRecientes.total === 0 ? (
                                    <p className="text-gray-400 text-center py-4 text-sm">No hay cambios recientes</p>
                                ) : (
                                    <div className="space-y-1 max-h-72 overflow-y-auto">
                                        {cambiosRecientes.cambios.map((cambio) => (
                                            <div key={cambio.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded transition">
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-900">
                                                        <span className="font-medium">{cambio.docente}</span>
                                                        {' '}asignado a{' '}
                                                        <span className="font-medium">{cambio.materia}</span>
                                                        {' '}({cambio.comision})
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {cambio.cargo} • {cambio.fecha_relativa}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-gray-400 flex-shrink-0">{cambio.fecha}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

        </AuthenticatedLayout>
    );
}
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import KPICard from '@/Components/Dashboard/KPICard';
import StatusIndicator from '@/Components/Dashboard/StatusIndicator';
import AlertList from '@/Components/Dashboard/AlertList';

export default function DashboardSecretaria({
    user,
    instituto,
    institutos,
    resumenEjecutivo,
    distribucionDedicaciones,
    docentesSobrecargados,
    materiasSinCobertura,
    estadisticasCarreras,
    evolucionHistorica,
}) {
    const [currentTab, setCurrentTab] = useState('resumen');
    const [currentDate] = useState(() => new Date());

    const handleInstitutoChange = (id) => {
        router.get(window.location.pathname,
            { instituto_id: id },
            {
                preserveState: true,
                preserveScroll: true
            }
        );
    };

    // Preparar alertas de docentes sobrecargados
    const alertasSobrecarga = docentesSobrecargados.map(doc => ({
        title: doc.nombre,
        description: `${doc.horasAsignadas}h asignadas / ${doc.horasMaximas}h máximas (${doc.dedicacion})`,
        details: `Exceso: ${doc.exceso} horas (${doc.porcentajeExceso}%)`,
    }));

    // Preparar alertas de materias sin cobertura
    const alertasSinCobertura = materiasSinCobertura.map(mat => ({
        title: mat.materiaNombre,
        description: `Comisión: ${mat.comisionNombre} - ${mat.turno}`,
        details: `Sede: ${mat.sede}`,
    }));

    const tabs = [
        { id: 'resumen', label: 'Resumen' },
        { id: 'carreras', label: 'Carreras' },
        { id: 'docentes', label: 'Docentes' },
        { id: 'alertas', label: 'Alertas', badge: alertasSobrecarga.length + alertasSinCobertura.length },
        { id: 'tendencias', label: 'Tendencias' },
    ];

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Dashboard Secretaría Académica
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Vista global de institutos</p>
                </div>
            }
        >
            <Head title="Dashboard Secretaría" />



                    {/* HEADER CON ESTADO GENERAL */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Estado General del Instituto
                                </h3>
                                <p className="text-gray-600 mt-1">
                                    Año {currentDate.getFullYear()}
                                </p>
                            </div>
                            <div className="flex items-center gap-x-4">
                                <div className="w-64">
                                    <select
                                        value={instituto?.id ? String(instituto.id) : 'all'}
                                        onChange={(e) => handleInstitutoChange(e.target.value)}
                                        className="block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                    >
                                        <option value="all">Todos los Institutos</option>
                                        {institutos.map((inst) => (
                                            <option key={inst.id} value={String(inst.id)}>
                                                {inst.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <StatusIndicator status={resumenEjecutivo.estadoGeneral} />
                            </div>
                        </div>
                    </div>

                    {/* KPI CARDS - RESUMEN EJECUTIVO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <KPICard
                            title="Carreras Activas"
                            value={resumenEjecutivo.totalCarreras}
                            subtitle={instituto.id === 'all' ? 'En todos los institutos' : `En el ${instituto.nombre}`}
                            status="neutral"
                        />
                        <KPICard
                            title="Docentes Activos"
                            value={resumenEjecutivo.totalDocentes}
                            subtitle={instituto.id === 'all' ? 'En todos los institutos' : 'Dictando en el instituto'}
                            status="neutral"
                        />
                        <KPICard
                            title="Comisiones"
                            value={resumenEjecutivo.totalComisiones}
                            subtitle={`${resumenEjecutivo.comisionesConCobertura} con cobertura`}
                            status="neutral"
                        />
                        <KPICard
                            title="Cobertura"
                            value={`${resumenEjecutivo.porcentajeCobertura}%`}
                            subtitle={`${resumenEjecutivo.comisionesConCobertura}/${resumenEjecutivo.totalComisiones} comisiones`}
                            status={resumenEjecutivo.estadoGeneral}
                        />
                    </div>

                    {/* TABS DE NAVEGACIÓN */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex gap-x-8" aria-label="Tabs">
                            {tabs.map(tab => (
                                <button
                                    type="button"
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
                                    {tab.badge > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* CONTENIDO DE TABS */}

                    {/* TAB: RESUMEN */}
                    {currentTab === 'resumen' && (
                        <div className="space-y-6">
                            {/* Distribución de Dedicaciones */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Distribución de Dedicaciones
                                </h3>
                                <div className="space-y-3">
                                    {distribucionDedicaciones.map((item, index) => (
                                        <div key={item.nombre || index} className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {item.nombre}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        {item.cantidad} docentes ({item.porcentaje}%)
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-indigo-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${item.porcentaje}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Vista rápida de alertas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <KPICard
                                    title="Docentes Sobrecargados"
                                    value={docentesSobrecargados.length}
                                    subtitle="Exceden horas máximas"
                                    status={docentesSobrecargados.length > 0 ? 'red' : 'green'}
                                />
                                <KPICard
                                    title="Materias Sin Cobertura"
                                    value={materiasSinCobertura.length}
                                    subtitle="Sin docente responsable"
                                    status={materiasSinCobertura.length > 0 ? 'red' : 'green'}
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB: CARRERAS */}
                    {currentTab === 'carreras' && (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Carrera
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Materias
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Comisiones
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cobertura
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Docentes
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {estadisticasCarreras.map((carrera, index) => (
                                        <tr key={carrera.carreraNombre || index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {carrera.carreraNombre}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {carrera.totalMaterias}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {carrera.totalComisiones}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`text-sm font-semibold ${carrera.porcentajeCobertura >= 90 ? 'text-green-600' :
                                                        carrera.porcentajeCobertura >= 70 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                        }`}>
                                                        {carrera.porcentajeCobertura}%
                                                    </span>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        ({carrera.comisionesConCobertura}/{carrera.totalComisiones})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {carrera.totalDocentes}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TAB: DOCENTES */}
                    {currentTab === 'docentes' && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Distribución de Dedicaciones
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {distribucionDedicaciones.map((item, index) => (
                                    <div key={item.nombre || index} className="border border-gray-200 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-1">{item.nombre}</p>
                                        <p className="text-2xl font-bold text-gray-900">{item.cantidad}</p>
                                        <p className="text-xs text-gray-500">{item.porcentaje}% del total</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB: ALERTAS */}
                    {currentTab === 'alertas' && (
                        <div className="space-y-6">
                            <AlertList
                                title="Docentes Sobrecargados"
                                alerts={alertasSobrecarga}
                                emptyMessage="✅ No hay docentes sobrecargados"
                            />
                            <AlertList
                                title="Materias Sin Cobertura"
                                alerts={alertasSinCobertura}
                                emptyMessage="✅ Todas las comisiones tienen cobertura"
                            />
                        </div>
                    )}

                    {/* TAB: TENDENCIAS */}
                    {currentTab === 'tendencias' && (
                        <div className="space-y-6">
                            {/* Evolución de Docentes */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Evolución de Docentes
                                </h3>
                                {evolucionHistorica.docentes.length > 0 ? (
                                    <div className="space-y-2">
                                        {evolucionHistorica.docentes.map((item) => (
                                            <div key={item.anio} className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-sm font-medium text-gray-700">Año {item.anio}</span>
                                                <span className="text-sm text-gray-900">{item.cantidad} docentes</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No hay datos históricos disponibles</p>
                                )}
                            </div>

                            {/* Evolución de Comisiones */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Evolución de Comisiones
                                </h3>
                                {evolucionHistorica.comisiones.length > 0 ? (
                                    <div className="space-y-2">
                                        {evolucionHistorica.comisiones.map((item) => (
                                            <div key={item.anio} className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-sm font-medium text-gray-700">Año {item.anio}</span>
                                                <span className="text-sm text-gray-900">{item.cantidad} comisiones</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No hay datos históricos disponibles</p>
                                )}
                            </div>

                            {/* Evolución de Carreras */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Nuevas Carreras
                                </h3>
                                {evolucionHistorica.carreras.length > 0 ? (
                                    <div className="space-y-2">
                                        {evolucionHistorica.carreras.map((item) => (
                                            <div key={item.anio} className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-sm font-medium text-gray-700">Año {item.anio}</span>
                                                <span className="text-sm text-gray-900">{item.cantidad} carreras creadas</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No hay datos históricos disponibles</p>
                                )}
                            </div>
                        </div>
                    )}
        </AuthenticatedLayout>
    );
}

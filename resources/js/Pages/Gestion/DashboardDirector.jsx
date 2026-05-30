import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import KPICard from '@/Components/Dashboard/KPICard';
import StatusIndicator from '@/Components/Dashboard/StatusIndicator';
import AlertList from '@/Components/Dashboard/AlertList';

export default function DashboardDirector({
    user,
    instituto,
    resumenGeneral,
    distribucionRH,
    estadoCarreras,
    alertasDocentes,
    materiasCriticas,
    comparativoInstitutos,
    metricasComparativas,
    proyecciones
}) {
    const [currentTab, setCurrentTab] = useState('resumen');
    const [currentDate] = useState(() => new Date());

    // Asegurarnos de que los datos internos no sean null
    const safeResumen = resumenGeneral ?? { totalDocentes: 0, totalCarreras: 0, totalComisiones: 0, porcentajeCobertura: 0, estado: 'Crítico' };
    const safeRH = distribucionRH ?? { porDedicacion: [], porModalidad: [] };
    const safeAlertas = alertasDocentes ?? { sobrecargados: [], disponibles: [] };
    const safeMateriasCriticas = materiasCriticas ?? [];
    const safeMetricas = metricasComparativas ?? { coberturaActual: 0, promedioInstitucional: 0, diferencia: 0 };
    const safeProyecciones = proyecciones ?? { materiasSinAsignacion: [], mensaje: '' };

    // Preparar alertas para AlertList
    const alertasMaterias = safeMateriasCriticas.map(mat => ({
        title: mat.materia,
        description: `Comisión ${mat.comision} - Turno ${mat.turno}`,
        details: mat.motivo
    }));

    const alertasSobrecarga = (safeAlertas.sobrecargados ?? []).map(doc => ({
        title: doc.docente,
        description: `${doc.cargo} - ${doc.horas}h/${doc.max}h`,
        details: `Exceso: ${doc.exceso} horas`
    }));

    const tabs = [
        { id: 'resumen', label: 'Resumen' },
        { id: 'carreras', label: 'Carreras' },
        { id: 'docentes', label: 'Recursos Humanos' },
        { id: 'proyecciones', label: 'Proyecciones y Comparativa' },
        { id: 'alertas', label: 'Alertas', badge: alertasMaterias.length + alertasSobrecarga.length },
    ];

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Dashboard Director de Instituto
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{instituto?.nombre}</p>
                </div>
            }
        >
            <Head title="Dashboard Director" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* HEADER CON ESTADO GENERAL */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Gestión del Instituto
                                </h3>
                                <p className="text-gray-600 mt-1">
                                    Año Académico {currentDate.getFullYear()}
                                </p>
                            </div>
                            <div className="flex items-center gap-x-6">
                                <StatusIndicator status={
                                    safeResumen.porcentajeCobertura >= 80 ? 'green' : 
                                    (safeResumen.porcentajeCobertura >= 60 ? 'yellow' : 'red')
                                } />
                            </div>
                        </div>
                    </div>

                    {/* KPI CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <KPICard
                            title="Plantel Docente"
                            value={safeResumen.totalDocentes}
                            subtitle="Docentes activos"
                            status="neutral"
                        />
                        <KPICard
                            title="Oferta Académica"
                            value={safeResumen.totalCarreras}
                            subtitle="Carreras en el instituto"
                            status="neutral"
                        />
                        <KPICard
                            title="Comisiones"
                            value={safeResumen.totalComisiones}
                            subtitle="Total de cursos"
                            status="neutral"
                        />
                        <KPICard
                            title="Cobertura Global"
                            value={`${safeResumen.porcentajeCobertura}%`}
                            subtitle={`Prom. Univ: ${safeMetricas.promedioInstitucional}%`}
                            status={
                                safeResumen.porcentajeCobertura >= 80 ? 'green' : 
                                (safeResumen.porcentajeCobertura >= 60 ? 'yellow' : 'red')
                            }
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Benchmarking - Comparativo */}
                                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Cobertura Comparativa por Instituto
                                    </h3>
                                    <div className="space-y-4">
                                        {(comparativoInstitutos ?? []).map((ins, index) => (
                                            <div key={ins.nombre || index}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-sm font-medium ${ins.esActual ? 'text-indigo-600 font-bold' : 'text-gray-700'}`}>
                                                        {ins.nombre} {ins.esActual ? '(Mi Instituto)' : ''}
                                                    </span>
                                                    <span className="text-sm text-gray-600">{ins.cobertura}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div 
                                                        className={`${ins.esActual ? 'bg-indigo-600' : 'bg-gray-400'} h-2.5 rounded-full transition-all`} 
                                                        style={{ width: `${ins.cobertura}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Resumen de Alertas */}
                                <div className="space-y-6">
                                    <KPICard
                                        title="Materias Críticas"
                                        value={alertasMaterias.length}
                                        subtitle="Sin cobertura de roles básica"
                                        status={alertasMaterias.length > 0 ? 'red' : 'green'}
                                    />
                                    <KPICard
                                        title="Alertas de Sobrecarga"
                                        value={alertasSobrecarga.length}
                                        subtitle="Docentes excedidos en horas"
                                        status={alertasSobrecarga.length > 0 ? 'yellow' : 'green'}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: CARRERAS */}
                    {currentTab === 'carreras' && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[600px]">
                            <div className="overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrera</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Estado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Alumnos</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Materias</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cobertura</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {(estadoCarreras ?? []).map((carrera, index) => (
                                            <tr key={carrera.nombre || index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{carrera.nombre}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${carrera.estado === 'Activa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {carrera.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{carrera.alumnos}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{carrera.materias}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className={`text-sm font-bold mr-4 w-12 ${
                                                            carrera.porcentaje >= 80 ? 'text-green-600' : 
                                                            (carrera.porcentaje >= 60 ? 'text-yellow-600' : 'text-red-600')
                                                        }`}>
                                                            {carrera.porcentaje}%
                                                        </span>
                                                        <div className="flex-1 min-w-[100px] bg-gray-200 rounded-full h-2">
                                                            <div 
                                                                className={`h-2 rounded-full ${
                                                                    carrera.porcentaje >= 80 ? 'bg-green-500' : 
                                                                    (carrera.porcentaje >= 60 ? 'bg-yellow-500' : 'bg-red-500')
                                                                }`}
                                                                style={{ width: `${carrera.porcentaje}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB: DOCENTES */}
                    {currentTab === 'docentes' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Distribución por Dedicación
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {(safeRH.porDedicacion ?? []).map((item, index) => (
                                        <div key={item.nombre || index} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                                            <p className="text-sm text-gray-600 mb-1">{item.nombre}</p>
                                            <p className="text-2xl font-bold text-gray-900">{item.cantidad}</p>
                                            <p className="text-xs text-gray-500">{item.porcentaje}% del total</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Distribución por Modalidad de Desempeño
                                </h3>
                                <div className="space-y-4">
                                    {(safeRH.porModalidad ?? []).map((item, index) => (
                                        <div key={item.nombre || index}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">{item.nombre}</span>
                                                <span className="text-sm text-gray-600">{item.cantidad} docentes ({item.porcentaje}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-indigo-500 h-2 rounded-full transition-all" 
                                                    style={{ width: `${item.porcentaje}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Balance de Capacidad Docente (Ociosa vs Sobrecarga)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-100">
                                            <span className="text-green-800 font-bold">Capacidad Ociosa</span>
                                            <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded">
                                                {safeAlertas.disponibles?.length ?? 0} docentes
                                            </span>
                                        </div>
                                        <div className="max-h-[250px] overflow-y-auto pr-2 space-y-2">
                                            {(safeAlertas.disponibles ?? []).map((doc, idx) => (
                                                <div key={doc.docente || idx} className="text-sm p-2 border-b border-gray-50 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{doc.docente}</p>
                                                        <p className="text-xs text-gray-500">{doc.cargo}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-green-600 font-bold">{doc.horas}h / {doc.min}h</p>
                                                        <p className="text-[10px] text-gray-400">Disponible: {doc.faltante}h</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg border border-orange-100">
                                            <span className="text-orange-800 font-bold">Sobrecarga Actual</span>
                                            <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded">
                                                {safeAlertas.sobrecargados?.length ?? 0} docentes
                                            </span>
                                        </div>
                                        <div className="max-h-[250px] overflow-y-auto pr-2 space-y-2">
                                            {(safeAlertas.sobrecargados ?? []).map((doc, idx) => (
                                                <div key={doc.docente || idx} className="text-sm p-2 border-b border-gray-50 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{doc.docente}</p>
                                                        <p className="text-xs text-gray-500">{doc.cargo}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-orange-600 font-bold">{doc.horas}h / {doc.max}h</p>
                                                        <p className="text-[10px] text-gray-400">Exceso: {doc.exceso}h</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: PROYECCIONES */}
                    {currentTab === 'proyecciones' && (
                        <div className="space-y-6">
                            {/* Explicación del apartado */}
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex items-start shadow-sm">
                                <span className="mr-3 text-indigo-500 font-bold">📊</span>
                                <p className="text-sm text-indigo-800">
                                    Este apartado permite visualizar la <strong>cobertura docente</strong> actual y futura, comparando el rendimiento del instituto con la media de la universidad para optimizar la planificación académica.
                                </p>
                            </div>

                            {/* Comparativa Detallada */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Comparativa Institucional: Instituto vs Promedio Universidad</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-sm text-gray-500 mb-2 uppercase font-bold tracking-widest">Tu Cobertura</p>
                                        <p className="text-4xl font-black text-indigo-600">{safeMetricas.coberturaActual}%</p>
                                    </div>
                                    <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-sm text-gray-500 mb-2 uppercase font-bold tracking-widest">Promedio Global</p>
                                        <p className="text-4xl font-black text-gray-700">{safeMetricas.promedioInstitucional}%</p>
                                    </div>
                                    <div className={`text-center p-6 rounded-xl border ${safeMetricas.diferencia >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                        <p className="text-sm text-gray-500 mb-2 uppercase font-bold tracking-widest">Desviación</p>
                                        <p className={`text-4xl font-black ${safeMetricas.diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {safeMetricas.diferencia > 0 ? '+' : ''}{safeMetricas.diferencia}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Próximas Necesidades */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Proyección de Necesidades de Cobertura (Próximo Ciclo)</h3>
                                {safeProyecciones.materiasSinAsignacion.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materia</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {safeProyecciones.materiasSinAsignacion.map((p, i) => (
                                                    <tr key={p.materia + '_' + p.comision || i}>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.materia} (Com. {p.comision})</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{p.periodo}</td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <span className="text-red-600 font-bold">Sin asignación</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-center py-10 text-gray-400">No se han detectado necesidades de cobertura para los próximos períodos planificados.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: ALERTAS */}
                    {currentTab === 'alertas' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Panel 1: Materias Críticas */}
                            <div className="flex flex-col h-[500px] bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
                                    Materias Críticas e Incompletas
                                    {alertasMaterias.length > 0 && (
                                        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                                            {alertasMaterias.length}
                                        </span>
                                    )}
                                </h3>
                                <div className="flex-1 overflow-y-auto pr-2">
                                    {alertasMaterias.length > 0 ? (
                                        <AlertList alerts={alertasMaterias} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                            <span className="text-3xl mb-2">✅</span>
                                            <p className="text-gray-500 text-sm font-medium">Todas las materias tienen los roles básicos cubiertos</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Panel 2: Sobrecarga Docente */}
                            <div className="flex flex-col h-[500px] bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
                                    Docentes en Alerta de Sobrecarga
                                    {alertasSobrecarga.length > 0 && (
                                        <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                                            {alertasSobrecarga.length}
                                        </span>
                                    )}
                                </h3>
                                <div className="flex-1 overflow-y-auto pr-2">
                                    {alertasSobrecarga.length > 0 ? (
                                        <AlertList alerts={alertasSobrecarga} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                            <span className="text-3xl mb-2">✅</span>
                                            <p className="text-gray-500 text-sm font-medium">No hay docentes excediendo sus horas máximas</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

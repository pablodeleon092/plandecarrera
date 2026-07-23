import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import KPICard from '@/Components/Dashboard/KPICard';
import MateriasTab from "@/Pages/Gestion/Partials/MateriasTab";
import DocentesTab from "@/Pages/Gestion/Partials/DocentesTab";
import OverviewTab from "@/Pages/Gestion/Partials/OverviewTab";
import ComisionesTab from "@/Pages/Gestion/Partials/ComisionesTab";

export default function DashboardCoordinadorAcademico({ 
    auth, 
    metrics = { sharedPercentage: 0, multiCareerTeachersCount: 0, conflictsCount: 0, totalCareers: 0, totalComisiones: 0, comisionesSinCobertura: 0, porcentajeCobertura: 0 },
    stats = { multiCarrera: 0, monoCarrera: 0, institutoNombre: '', docentesDetalle: [] },
    materiasCompartidas = { list: [] },
    cargaCuatrimestral = [] 
}) {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard: {stats.institutoNombre}</h2>}
        >
            <Head title="Coordinación Académica" />
                    
                    {/* KPIs Globales */}
                    <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
                        <KPICard
                            title="% Materias Compartidas" 
                            value={`${metrics.sharedPercentage}%`} 
                            subtitle="Del total de oferta académica"
                        />
                        <KPICard
                            title="Docentes Multi-Carrera" 
                            value={metrics.multiCareerTeachersCount} 
                            subtitle="Dictan en 2 o más carreras"
                        />
                        <KPICard
                            title="Conflictos Detectados" 
                            value={metrics.conflictsCount} 
                            status={metrics.conflictsCount > 0 ? 'warning' : 'neutral'}
                            subtitle="Superposiciones horarias"
                        />
                        <KPICard
                            title="Total Carreras" 
                            value={metrics.totalCareers} 
                            subtitle="En el instituto"
                        />
                        <KPICard
                            title="Total Comisiones"
                            value={metrics.totalComisiones}
                            subtitle="Año actual"
                        />
                        <KPICard
                            title="Cobertura"
                            value={`${metrics.porcentajeCobertura}%`}
                            status={metrics.porcentajeCobertura >= 90 ? 'success' : (metrics.porcentajeCobertura >= 70 ? 'warning' : 'danger')}
                            subtitle="Con responsable activo"
                        />
                        <KPICard
                            title="Sin Cobertura"
                            value={metrics.comisionesSinCobertura}
                            status={metrics.comisionesSinCobertura > 0 ? 'danger' : 'success'}
                            subtitle="Comisiones del año actual"
                        />
                    </div>

                    {/* SECCIÓN 2: Pestañas de Navegación */}
                    <div className="flex border-b border-gray-200 mb-6 gap-x-8 bg-white p-4 rounded-t-lg shadow-sm">
                        <button 
                            type="button"
                            onClick={() => setActiveTab('overview')}
                            className={`pb-2 px-2 font-medium transition-colors duration-200 ${activeTab === 'overview' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                             Visión General
                        </button>
                        <button 
                            type="button"
                            onClick={() => setActiveTab('materias')}
                            className={`pb-2 px-2 font-medium transition-colors duration-200 ${activeTab === 'materias' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                              Materias Transversales
                        </button>
                        <button 
                            type="button"
                            onClick={() => setActiveTab('docentes')}
                            className={`pb-2 px-2 font-medium transition-colors duration-200 ${activeTab === 'docentes' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                             Docentes y Carga
                        </button>
                        <button
                            type="button"
                            onClick={() =>setActiveTab('comisiones')}
                            className={`pb-2 px-2 font-medium transition-colors duration-200 ${activeTab === 'comisiones' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Comisiones
                        </button>
                    </div>

                    {/* SECCIÓN 3: Contenido Dinámico */}
                    <div className="bg-white rounded-b-lg shadow-sm p-6 min-h-[400px]">
                        {activeTab === 'overview' && (
                            <OverviewTab 
                                metrics={metrics} 
                                stats={stats} 
                                materias={materiasCompartidas.list} 
                                superposiciones={stats.superposicionesDetalle} 
                            />
                        )}
                        {activeTab === 'materias' && (
                            // Pasamos la lista correctamente
                            <MateriasTab materias={materiasCompartidas.list} />
                        )}

                        {activeTab === 'docentes' && (
                            // Usamos el detalle de docentes que viene en 'stats'
                            <DocentesTab docentes={stats.docentesDetalle} />
                        )}
                        {activeTab === 'comisiones' && (
                            <ComisionesTab superposiciones={stats.superposicionesDetalle} />
                        )}
                    </div>

        </AuthenticatedLayout>
    );
}

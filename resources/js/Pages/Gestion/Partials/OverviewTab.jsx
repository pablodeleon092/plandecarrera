import React from 'react';
import { Chart } from "react-google-charts";

export default function OverviewTab({ metrics, stats, materias = [], superposiciones = [] }) {

    
    // Gráfico de Torta: Distribución de Docentes
    const dataDocentes = [
        ["Tipo", "Cantidad"],
        ["Solo 1 Carrera", stats.monoCarrera],
        ["Multi-Carrera", stats.multiCarrera],
    ];

    const opcionesTorta = {
        title: "Distribución de Planta Docente",
        pieHole: 0.4, 
        colors: ["#cbd5e1", "#4f46e5"], 
        legend: { position: "bottom" },
    };

    const topMaterias = [...materias]
        .sort((a, b) => b.carreras_nombres.length - a.carreras_nombres.length)
        .slice(0, 5);

    return (
        <div className="p-2">
            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* TARJETA 1: GRÁFICO DE DONA */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-700 font-bold mb-4">Eficiencia Docente</h3>
                    <div className="h-64">
                        <Chart
                            chartType="PieChart"
                            width="100%"
                            height="100%"
                            data={dataDocentes}
                            options={opcionesTorta}
                        />
                    </div>
                </div>

                {/* TARJETA 2: SUPERPOSICIONES (Resumen) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <h3 className="text-gray-700 font-bold mb-2">Estado de Alertas</h3>
                        <p className="text-sm text-gray-500 mb-6">Conflictos de horarios detectados en el ciclo actual.</p>
                        
                        {/* Diseño condicional: Si hay muchos errores vs si está todo bien */}
                        {superposiciones.length > 0 ? (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                                <div className="flex items-center">
                                    <span className="text-3xl mr-4">⚠️</span>
                                    <div>
                                        <span className="block text-red-700 font-bold text-xl">
                                            {superposiciones.length} Conflictos
                                        </span>
                                        <span className="text-red-600 text-sm">Requieren revisión manual</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
                                <p className="text-green-700 font-medium">✓ Sin conflictos detectados</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Botón decorativo abajo */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400 text-center">
                            Última actualización: {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-700 font-bold mb-6">Top Materias Más Compartidas</h3>
                    
                    <div className="space-y-4">
                        {topMaterias.map((materia) => {
                            const widthPercent = Math.min(materia.carreras_nombres.length * 20, 100); 
                            
                            return (
                                <div key={materia.id}>
                                    {/* Título y Valor numérico */}
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">{materia.nombre}</span>
                                        <span className="text-sm text-gray-500">{materia.carreras_nombres.length} carreras</span>
                                    </div>
                                    
                                    {/* La "Barra" (Contenedor gris fondo) */}
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        {/* El "Relleno" (Div azul con ancho dinámico) */}
                                        <div 
                                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                                            style={{ width: `${widthPercent}%` }}
                                        ></div>
                                    </div>
                                    
                                    {/* Lista pequeña de nombres de carreras */}
                                    <p className="text-xs text-gray-400 mt-1 truncate">
                                        {materia.carreras_nombres.join(', ')}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
import React, { useState } from 'react';

export default function ComisionesTab({ superposiciones = [] }) {
    const [expandido, setExpandido] = useState(null);
    const [modalDocente, setModalDocente] = useState(null);

    const toggleExpandir = (id) => {
        setExpandido(expandido === id ? null : id);
    };

    const abrirModal = (e, item) => {
        e.stopPropagation();
        setModalDocente(item);
    };

    const cerrarModal = () => setModalDocente(null);

    if (superposiciones.length === 0) {
        return (
            <div className="p-12 text-center border-2 border-dashed border-green-200 bg-green-50 rounded-xl">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <h3 className="text-green-800 font-bold text-lg">Todo en orden</h3>
                <p className="text-green-600 mt-2">
                    No se detectaron docentes con superposición de horarios.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* ENCABEZADO */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Alertas de Superposición</h3>
                    <p className="text-sm text-gray-500">Docentes con choques reales de horario entre comisiones.</p>
                </div>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold border border-red-200">
                    {superposiciones.length} Docentes con conflictos
                </span>
            </div>

            {/* LISTA */}
            <div className="space-y-2">
                {superposiciones.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">

                        {/* FILA PRINCIPAL */}
                        <button
                            type="button"
                            onClick={() => toggleExpandir(item.id)}
                            className="flex items-center justify-between px-6 py-4 bg-white hover:bg-red-50 cursor-pointer transition-colors w-full"
                        >
                            <div className="flex items-center gap-4">
                                <span className={`text-gray-400 transition-transform duration-200 ${expandido === item.id ? 'rotate-90' : ''}`}>
                                    ▶
                                </span>
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        {item.apellido}, {item.nombre}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {item.anio}, {item.cuatrimestre}º Cuatrimestre
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
                                    {item.cantidad_conflictos} {item.cantidad_conflictos === 1 ? 'choque' : 'choques'}
                                </span>
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => { e.stopPropagation(); abrirModal(e, item); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); abrirModal(e, item); } }}
                                    className="text-indigo-600 hover:text-indigo-900 font-medium text-sm hover:underline whitespace-nowrap cursor-pointer"
                                >
                                    Ver Comisiones →
                                </span>
                            </div>
                        </button>

                        {/* DETALLE EXPANDIBLE */}
                        {expandido === item.id && (
                            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-xs text-gray-500 uppercase border-b border-gray-200">
                                            <th className="pb-2 text-left">Día</th>
                                            <th className="pb-2 text-left">Comisión 1</th>
                                            <th className="pb-2 text-left">Horario</th>
                                            <th className="pb-2 text-left">Comisión 2</th>
                                            <th className="pb-2 text-left">Horario</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {item.choques.map((choque) => (
                                            <tr key={`${choque.comision1_id}-${choque.comision2_id}-${choque.dia}`} className="hover:bg-red-50 transition-colors">
                                                <td className="py-3">
                                                    <span className="capitalize bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                                                        {choque.dia}
                                                    </span>
                                                </td>
                                                <td className="py-3 font-medium text-gray-700">{choque.materia1}</td>
                                                <td className="py-3 text-gray-500">
                                                    {choque.inicio1?.substring(0, 5)} – {choque.fin1?.substring(0, 5)}
                                                </td>
                                                <td className="py-3 font-medium text-gray-700">{choque.materia2}</td>
                                                <td className="py-3 text-gray-500">
                                                    {choque.inicio2?.substring(0, 5)} – {choque.fin2?.substring(0, 5)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <p className="mt-4 text-xs text-gray-400 text-center">
                * Se detectan choques cuando dos comisiones comparten día y se pisan en horario.
            </p>

            {/* MODAL */}
            {modalDocente && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950 bg-opacity-50"
                    onClick={cerrarModal}
                    onKeyDown={(e) => { if (e.key === 'Escape') cerrarModal(); }}
                    role="presentation"
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header modal */}
                        <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-white font-bold text-lg">
                                    {modalDocente.apellido}, {modalDocente.nombre}
                                </h3>
                                <p className="text-red-200 text-sm">
                                    {modalDocente.cantidad_conflictos} {modalDocente.cantidad_conflictos === 1 ? 'choque detectado' : 'choques detectados'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={cerrarModal}
                                className="text-white hover:text-red-200 text-2xl font-bold leading-none"
                            >
                                ×
                            </button>
                        </div>

                        {/* Cuerpo modal */}
                        <div className="px-6 py-4 space-y-3">
                            <p className="text-sm text-gray-500 mb-4">
                                Estas son las comisiones en conflicto. Hacé click en una para ir a corregir el horario.
                            </p>

                            {[
                                ...new Map(
                                    modalDocente.choques.flatMap(c => [
                                        [c.comision1_id, { id: c.comision1_id, nombre: c.materia1, inicio: c.inicio1, fin: c.fin1, dia: c.dia }],
                                        [c.comision2_id, { id: c.comision2_id, nombre: c.materia2, inicio: c.inicio2, fin: c.fin2, dia: c.dia }],
                                    ])
                                ).values()
                            ].map((comision) => (
                                <a
                                    key={comision.id}
                                    href={`/comisiones/${comision.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors group"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-800 group-hover:text-indigo-700">
                                            {comision.nombre}
                                        </p>
                                        <p className="text-xs text-gray-400 capitalize mt-1">
                                            {comision.dia} · {comision.inicio?.substring(0, 5)} – {comision.fin?.substring(0, 5)}
                                        </p>
                                    </div>
                                    <span className="text-indigo-500 group-hover:text-indigo-700 text-lg">→</span>
                                </a>
                            ))}
                        </div>

                        {/* Footer modal */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                type="button"
                                onClick={cerrarModal}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
import React, { useState } from 'react';
import { router } from '@inertiajs/react';

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

const diasLabel = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
};

export default function ComisionHorarios({ comision, canDelete = false }) {
    const [horarios, setHorarios] = useState(comision.horarios || []);
    const [form, setForm] = useState({
        dia_semana: 'lunes',
        hora_inicio: '',
        hora_fin: '',
        aula: '',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAdd = () => {
        setErrors({});

        const newErrors = {};
        if (!form.hora_inicio) newErrors.hora_inicio = 'Requerido';
        if (!form.hora_fin) newErrors.hora_fin = 'Requerido';
        if (form.hora_fin && form.hora_inicio && form.hora_fin <= form.hora_inicio) {
            newErrors.hora_fin = 'Debe ser después de la hora de inicio';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setProcessing(true);
        router.post(
            route('horarios.store', comision.id),
            form,
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    setHorarios(page.props.comision?.horarios || horarios);
                    setForm({ dia_semana: 'lunes', hora_inicio: '', hora_fin: '', aula: '' });
                    setProcessing(false);
                },
                onError: (errs) => {
                    setErrors(errs);
                    setProcessing(false);
                },
            }
        );
    };

    const handleDelete = (horarioId) => {
        if (!confirm('¿Eliminar este horario?')) return;
        router.delete(route('horarios.destroy', horarioId), {
            preserveScroll: true,
            onSuccess: (page) => {
                setHorarios(page.props.comision?.horarios || horarios.filter(h => h.id !== horarioId));
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Lista de horarios existentes */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Horarios asignados</h3>
                {horarios.length === 0 ? (
                    <p className="text-gray-400 text-sm">No hay horarios cargados todavía.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 text-left">Día</th>
                                    <th className="px-4 py-3 text-left">Inicio</th>
                                    <th className="px-4 py-3 text-left">Fin</th>
                                    <th className="px-4 py-3 text-left">Aula</th>
                                    {canDelete && <th className="px-4 py-3 text-left">Acción</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {horarios.map((h) => (
                                    <tr key={h.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{diasLabel[h.dia_semana] ?? h.dia_semana}</td>
                                        <td className="px-4 py-3">{h.hora_inicio.substring(0, 5)}</td>
                                        <td className="px-4 py-3">{h.hora_fin.substring(0, 5)}</td>
                                        <td className="px-4 py-3">{h.aula || '—'}</td>
                                        {canDelete && (
                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(h.id)}
                                                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Formulario para agregar horario */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Agregar horario</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="dia_semana" className="block text-sm font-medium text-gray-700 mb-1">Día</label>
                        <select
                            id="dia_semana"                            name="dia_semana"
                            value={form.dia_semana}
                            onChange={handleChange}
                            className="block w-full border-gray-300 rounded-md shadow-sm text-sm"
                        >
                            {DIAS.map(d => (
                                <option key={d} value={d}>{diasLabel[d]}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="hora_inicio" className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
                        <input
                            id="hora_inicio"
                            type="text"
                            name="hora_inicio"
                            value={form.hora_inicio}
                            onChange={handleChange}
                            placeholder="08:00"
                            className="block w-full border-gray-300 rounded-md shadow-sm text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="hora_fin" className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
                        <input
                            id="hora_fin"
                            type="text"
                            name="hora_fin"
                            value={form.hora_fin}
                            onChange={handleChange}
                            placeholder="10:00"
                            className="block w-full border-gray-300 rounded-md shadow-sm text-sm"
                        />
                        {errors.hora_fin && <p className="text-red-500 text-xs mt-1">{errors.hora_fin}</p>}
                    </div>
                    <div>
                        <label htmlFor="aula" className="block text-sm font-medium text-gray-700 mb-1">Aula (opcional)</label>
                        <input
                            id="aula"
                            type="text"
                            name="aula"
                            value={form.aula}
                            onChange={handleChange}
                            placeholder="Ej: 12"
                            className="block w-full border-gray-300 rounded-md shadow-sm text-sm"
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={processing}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? 'Guardando...' : '+ Agregar horario'}
                    </button>
                </div>
            </div>
        </div>
    );
}

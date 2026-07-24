// resources/js/Pages/Materias/Partials/MateriaComisiones.jsx
import { Link } from '@inertiajs/react';

export default function MateriaComisiones({ comisiones, materia, canDelete = false }) {
    return (
        <div>
            <h3 className="text-2xl font-bold mb-6">Comisiones de la Materia</h3>
            {comisiones.length > 0 ? (
            <ul className="divide-y divide-gray-200">
                {comisiones.map((comision) => (
                    <li key={comision.id} className="py-4 flex justify-between items-center">
                        {/* Nombre de la comisión */}
                        <span className="text-gray-800 font-medium">
                            {comision.nombre}
                        </span>

                        {/* Contenedor de acciones */}
                        <div className="flex items-center gap-x-4">
                            <Link
                                href={route('comisiones.show', comision.id)}
                                className="text-blue-600 hover:underline"
                            >
                                Ver Detalles
                            </Link>
                            {canDelete && (
                                <Link
                                    href={route('comisiones.toggleStatus', comision.id)}
                                    method="patch"
                                    as="button"
                                    onBefore={() => 
                                        confirm(`¿Estás seguro de ${comision.estado ? 'desactivar' : 'activar'} esta comisión?`)
                                    }
                                    className={`px-3 py-1 rounded-full text-white transition ${
                                        comision.estado 
                                            ? 'bg-red-600 hover:bg-red-700' 
                                            : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                >
                                    {comision.estado ? 'Desactivar' : 'Activar'}
                                </Link>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            ) : (
                <p className="text-gray-600">No hay comisiones registradas para esta materia.</p>
            )}
            <div>
                <div className="mt-4">
                    <Link
                        href={route('comisiones.create', { materia_id: materia.id })}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold transition"
                        >
                        Agregar Comision
                    </Link>
                </div>
            </div>
        </div>
    );
}

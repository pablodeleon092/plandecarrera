import { Link } from '@inertiajs/react';

/**
 * ShowButton - Botón para ver detalles de un registro
 * 
 * @param {Object} item - El registro/item a mostrar
 * @param {Function|String} onShow - Función callback o ruta para navegar
 *   - Si es función: se ejecuta onClick
 *   - Si es string: se usa como ruta con Inertia Link (soporta :id placeholder)
 */
export default function ShowButton({ item, onShow }) {
    // Si no hay acción definida, no renderizar nada
    if (!onShow) return null;

    const className = "text-blue-600 hover:text-blue-900 transition";
    const title = "Ver detalle";

    // Ícono de ojo para "ver"
    const EyeIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );

    // Si onShow es una función, renderizar un botón
    if (typeof onShow === 'function') {
        return (
            <button
                onClick={() => onShow(item)}
                className={className}
                title={title}
            >
                <EyeIcon />
            </button>
        );
    }

    // Si onShow es un string (ruta), renderizar un Link de Inertia
    const href = typeof onShow === 'string'
        ? onShow.replace(':id', item.id)  // Reemplaza :id con el ID del item
        : `${onShow}/${item.id}`;          // O concatena el ID al final

    return (
        <Link href={href} className={className} title={title}>
            <EyeIcon />
        </Link>
    );
}

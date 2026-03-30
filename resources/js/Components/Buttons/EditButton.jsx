import { Link } from '@inertiajs/react';

/**
 * EditButton - Botón para editar un registro
 * 
 * @param {Object} item - El registro/item a editar
 * @param {Function|String} onEdit - Función callback o ruta para navegar
 *   - Si es función: se ejecuta onClick
 *   - Si es string: se usa como ruta con Inertia Link (soporta :id placeholder)
 *   - Por defecto añade /edit al final de la ruta si solo se pasa la base
 */
export default function EditButton({ item, onEdit }) {
    // Si no hay acción definida, no renderizar nada
    if (!onEdit) return null;

    const className = "text-green-600 hover:text-green-900 transition";
    const title = "Editar";

    // Ícono de lápiz para "editar"
    const EditIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
        </svg>
    );

    // Si onEdit es una función, renderizar un botón
    if (typeof onEdit === 'function') {
        return (
            <button
                onClick={() => onEdit(item)}
                className={className}
                title={title}
            >
                <EditIcon />
            </button>
        );
    }

    // Si onEdit es un string (ruta), renderizar un Link de Inertia
    const href = typeof onEdit === 'string'
        ? onEdit.replace(':id', item.id)      // Reemplaza :id con el ID del item
        : `${onEdit}/${item.id}/edit`;        // O concatena el ID + /edit al final

    return (
        <Link href={href} className={className} title={title}>
            <EditIcon />
        </Link>
    );
}

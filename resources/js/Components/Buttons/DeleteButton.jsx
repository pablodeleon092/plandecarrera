/**
 * DeleteButton - Botón para eliminar un registro
 * 
 * @param {Object} item - El registro/item a eliminar
 * @param {Function} onDelete - Función callback que se ejecuta al hacer click
 * 
 * NOTA: Este botón solo acepta funciones (no rutas), ya que eliminar
 *       normalmente requiere confirmación del usuario y lógica adicional.
 */
export default function DeleteButton({ item, onDelete }) {
    // Si no hay acción definida, no renderizar nada
    if (!onDelete) return null;

    const className = "text-red-600 hover:text-red-900 transition";
    const title = "Eliminar";

    // Ícono de basurero para "eliminar"
    const TrashIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
        </svg>
    );

    return (
        <button
            onClick={() => onDelete(item)}
            className={className}
            title={title}
        >
            <TrashIcon />
        </button>
    );
}

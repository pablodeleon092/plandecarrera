import { Link } from '@inertiajs/react';

export default function IconButton({
    action,
    item,
    onEdit,
    onShow,
    onDelete,
    isActive,
    onClick,
    className = '',
    ...props
}) {
    let finalClassName = '';
    let title = '';
    let Icon = null;
    let handler = null;
    let urlSuffix = '';

    if (action === 'edit') {
        finalClassName = 'btn-icon-success';
        title = 'Editar';
        handler = onEdit;
        urlSuffix = 'edit';
        Icon = () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        );
    } else if (action === 'show') {
        finalClassName = 'btn-icon-primary';
        title = 'Ver Detalles';
        handler = onShow;
        urlSuffix = '';
        Icon = () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        );
    } else if (action === 'delete') {
        finalClassName = 'btn-icon-danger';
        title = 'Eliminar';
        handler = onDelete;
        Icon = () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        );
    } else if (action === 'toggle') {
        finalClassName = isActive ? 'btn-icon-toggle-on' : 'btn-icon-toggle-off';
        title = isActive ? 'Desactivar' : 'Activar';
        handler = onClick;
        Icon = () => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isActive ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
            </svg>
        );
    }

    if (!handler) return null;

    if (typeof handler === 'function') {
        return (
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation(); // Evita clicks propagados en filas enteras
                    handler(item);
                }}
                className={`${finalClassName} ${className}`.trim()}
                title={title}
                {...props}
            >
                <Icon />
            </button>
        );
    }

    const href = handler.includes(':id')
        ? handler.replace(':id', item?.id)
        : urlSuffix
            ? `${handler}/${item?.id}/${urlSuffix}`
            : `${handler}/${item?.id}`;

    return (
        <Link 
            href={href} 
            className={`${finalClassName} ${className}`.trim()} 
            title={title} 
            onClick={(e) => e.stopPropagation()}
            {...props}
        >
            <Icon />
        </Link>
    );
}

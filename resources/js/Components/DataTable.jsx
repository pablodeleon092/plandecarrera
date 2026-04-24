import IconButton from '@/Components/IconButton';
import { Link } from '@inertiajs/react';

export default function DataTable({
    columns = [],
    data = [],
    onShow,
    onEdit,
    onDelete,
    onToggleStatus,
    emptyMessage = 'Sin registros.',
    emptyIcon,
    actions = true,
    hover = true,
    containerClassName = '',
    dense = false,
    statusKey = 'estado',
    disableScroll = false
}) {
    const EmptyIcon = () => (
        emptyIcon || (
            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        )
    );

    // Componente simplificado que usa los botones modulares
    const ActionButtons = ({ item }) => {
        // Si el item no trae objeto 'can', por defecto permitimos (para no romper otros modelos)
        // Pero si lo trae, respetamos lo que diga el servidor.
        const permissions = item.can || { view: true, update: true, delete: true, toggle: true };

        return (
            <div className="flex items-center justify-end gap-3">
                {onShow && permissions.view && (
                    <IconButton action="show" item={item} onShow={onShow} />
                )}
                
                {onEdit && permissions.update && (
                    <IconButton action="edit" item={item} onEdit={onEdit} />
                )}
                
                {onDelete && permissions.delete && (
                    <IconButton action="delete" item={item} onDelete={onDelete} />
                )}
                
                {onToggleStatus && permissions.update && (
                    <IconButton 
                        action="toggle"
                        isActive={!!item[statusKey]}
                        onClick={() => onToggleStatus(item)}
                    />
                )}
            </div>
        );
    };

    const hasAnyAction = (item) => {
        const p = item.can || { view: true, update: true, delete: true };
        return (onShow && p.view) || (onEdit && p.update) || (onDelete && p.delete) || (onToggleStatus && p.update);
    };

    const paddingClass = dense ? 'px-3 py-2' : 'px-6 py-4';
    const headerPaddingClass = dense ? 'px-3 py-2' : 'px-6 py-3';

    return (
        <div className={`datatable-container ${containerClassName}`}>
            <div className={disableScroll ? '' : 'overflow-x-auto'}>
                <table className="datatable-table">
                    <thead className="datatable-thead">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className={`${headerPaddingClass} datatable-th`}
                                >
                                    {col.label}
                                </th>
                            ))}
                            {actions && data.some(item => hasAnyAction(item)) && (
                                <th className={`${headerPaddingClass} datatable-th text-right`}>
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="datatable-tbody">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions && (onShow || onEdit || onDelete || onToggleStatus) ? 1 : 0)}
                                    className="datatable-empty"
                                >
                                    <div className="flex flex-col items-center">
                                        <EmptyIcon />
                                        <p className="text-lg">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className={hover ? 'hover:bg-gray-50 transition' : ''}>
                                    {columns.map((col, index) => (
                                        <td
                                            key={index}
                                            className={`${paddingClass} ${col.nowrap !== false ? 'whitespace-nowrap' : ''} ${col.className || 'text-sm text-gray-900'
                                                }`}
                                        >
                                            {col.render ? col.render(item) : item[col.key]}
                                        </td>
                                    ))}
                                    {actions && hasAnyAction(item) ? (
                                        <td className={`${paddingClass} whitespace-nowrap text-right text-sm font-medium`}>
                                            <ActionButtons item={item} />
                                        </td>
                                    ) : actions && <td className={paddingClass}></td>}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

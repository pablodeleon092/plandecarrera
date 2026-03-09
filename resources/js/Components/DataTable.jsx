import { Link } from '@inertiajs/react';
import ToggleStatusButton from './Buttons/ToggleStatusButton';
import ShowButton from './Buttons/ShowButton';
import EditButton from './Buttons/EditButton';
import DeleteButton from './Buttons/DeleteButton';

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
    const ActionButtons = ({ item }) => (
        <div className="flex items-center justify-end gap-3">
            <ShowButton item={item} onShow={onShow} />
            <EditButton item={item} onEdit={onEdit} />
            <DeleteButton item={item} onDelete={onDelete} />
            {onToggleStatus && (
                <ToggleStatusButton
                    isActive={!!item[statusKey]}
                    onClick={() => onToggleStatus(item)}
                />
            )}
        </div>
    );

    const paddingClass = dense ? 'px-3 py-2' : 'px-6 py-4';
    const headerPaddingClass = dense ? 'px-3 py-2' : 'px-6 py-3';

    return (
        <div className={`bg-white rounded-lg shadow overflow-hidden ${containerClassName}`}>
            <div className={'overflow-x-auto'}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className={`${headerPaddingClass} text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
                                >
                                    {col.label}
                                </th>
                            ))}
                            {actions && (onShow || onEdit || onDelete || onToggleStatus) && (
                                <th className={`${headerPaddingClass} text-right text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions && (onShow || onEdit || onDelete || onToggleStatus) ? 1 : 0)}
                                    className="px-6 py-8 text-center text-gray-500"
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
                                    {actions && (onShow || onEdit || onDelete || onToggleStatus) && (
                                        <td className={`${paddingClass} whitespace-nowrap text-right text-sm font-medium`}>
                                            <ActionButtons item={item} />
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

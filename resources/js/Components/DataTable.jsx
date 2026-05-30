import { useState, useMemo } from 'react';
import IconButton from '@/Components/IconButton';
import { Link } from '@inertiajs/react';

const DefaultEmptyIcon = () => (
    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

function ActionButtons({ item, onShow, onEdit, onDelete, onToggleStatus, statusKey }) {
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
}

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
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key] ?? '';
                let bValue = b[sortConfig.key] ?? '';

                if (Array.isArray(aValue)) {
                    aValue = aValue.map(item => item.nombre || '').join(', ').toLowerCase();
                }
                if (Array.isArray(bValue)) {
                    bValue = bValue.map(item => item.nombre || '').join(', ').toLowerCase();
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return <span className="ml-1 opacity-30">↕</span>;
        }
        return sortConfig.direction === 'asc'
            ? <span className="ml-1 text-blue-600">↑</span>
            : <span className="ml-1 text-blue-600">↓</span>;
    };

    const EmptyIcon = emptyIcon || DefaultEmptyIcon;

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
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`${headerPaddingClass} datatable-th ${col.sortable !== false ? 'cursor-pointer select-none hover:bg-gray-100' : ''}`}
                                    onClick={() => col.sortable !== false && requestSort(col.key)}
                                >
                                    <div className="flex items-center">
                                        {col.label}
                                        {col.sortable !== false && getSortIcon(col.key)}
                                    </div>
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
                        {sortedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    className="datatable-empty"
                                >
                                    <div className="flex flex-col items-center">
                                        <EmptyIcon />
                                        <p className="text-lg">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((item) => (
                                <tr key={item.id} className={hover ? 'hover:bg-gray-50 transition' : ''}>
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`${paddingClass} ${col.nowrap !== false ? 'whitespace-nowrap' : ''} ${col.className || 'text-sm text-gray-900'}`}
                                        >
                                            {col.render ? col.render(item) : item[col.key]}
                                        </td>
                                    ))}
                                    {actions && hasAnyAction(item) ? (
                                        <td className={`${paddingClass} whitespace-nowrap text-right text-sm font-medium`}>
                                            <ActionButtons
                                                item={item}
                                                onShow={onShow}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                                onToggleStatus={onToggleStatus}
                                                statusKey={statusKey}
                                            />
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
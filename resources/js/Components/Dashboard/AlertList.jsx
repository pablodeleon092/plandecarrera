import React from 'react';

export default function AlertList({ alerts = [], title, type = 'warning' }) {
    if (!alerts || alerts.length === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-500 text-center text-sm">No hay alertas</p>
            </div>
        );
    }

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
            case 'error':
                return 'bg-red-50 border-red-200 border-l-4 border-l-red-500';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 border-l-4 border-l-yellow-500';
            case 'info':
                return 'bg-blue-50 border-blue-200 border-l-4 border-l-blue-500';
            case 'success':
                return 'bg-green-50 border-green-200 border-l-4 border-l-green-500';
            default:
                return 'bg-gray-50 border-gray-200 border-l-4 border-l-gray-500';
        }
    };

    const getTypeIcon = () => {
        switch (type) {
            case 'danger':
            case 'error':
                return '⚠️';
            case 'warning':
                return '⚡';
            case 'info':
                return 'ℹ️';
            case 'success':
                return '✓';
            default:
                return '•';
        }
    };

    return (
        <div className="space-y-3">
            {title && <h3 className="font-semibold text-gray-700 mb-3">{title}</h3>}
            {alerts.map((alert, index) => (
                <div key={alert.id || `alert-${index}`} className={`rounded-lg p-4 ${getTypeStyles()}`}>
                    <div className="flex items-start">
                        <span className="mr-3 text-lg">{getTypeIcon()}</span>
                        <div className="flex-1">
                            {alert.title && (
                                <p className="font-medium text-gray-800">{alert.title}</p>
                            )}
                            {alert.description && (
                                <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
                            )}
                            {alert.details && (
                                <p className="text-xs text-gray-600 mt-2 italic">{alert.details}</p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

import React from 'react';

export default function AlertList({ alerts, title, emptyMessage }) {
    if (!alerts || alerts.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-500 text-center py-8">{emptyMessage || 'No hay alertas'}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <div className="space-y-3">
                {alerts.map((alert, index) => (
                    <div
                        key={index}
                        className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            <svg
                                className="h-5 w-5 text-red-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-red-800">{alert.title || alert.nombre}</p>
                            {alert.description && (
                                <p className="text-sm text-red-700 mt-1">{alert.description}</p>
                            )}
                            {alert.details && (
                                <p className="text-xs text-red-600 mt-1">{alert.details}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

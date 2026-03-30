import React from 'react';

export default function StatusIndicator({ status, label }) {
    const getStatusConfig = () => {
        switch (status) {
            case 'green':
                return {
                    color: 'bg-green-500',
                    textColor: 'text-green-700',
                    bgColor: 'bg-green-100',
                    label: label || 'Óptimo',
                };
            case 'yellow':
                return {
                    color: 'bg-yellow-500',
                    textColor: 'text-yellow-700',
                    bgColor: 'bg-yellow-100',
                    label: label || 'Atención',
                };
            case 'red':
                return {
                    color: 'bg-red-500',
                    textColor: 'text-red-700',
                    bgColor: 'bg-red-100',
                    label: label || 'Crítico',
                };
            default:
                return {
                    color: 'bg-gray-500',
                    textColor: 'text-gray-700',
                    bgColor: 'bg-gray-100',
                    label: label || 'Desconocido',
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${config.color} shadow-lg animate-pulse`}></div>
            <span className={`text-sm font-semibold ${config.textColor} px-3 py-1 rounded-full ${config.bgColor}`}>
                {config.label}
            </span>
        </div>
    );
}

import React from 'react';

export default function KPICard({ title, value, subtitle, trend, status = 'neutral', icon }) {
    const getStatusColor = () => {
        switch (status) {
            case 'success':
            case 'green':
                return 'border-green-500 bg-green-50';
            case 'warning':
            case 'yellow':
                return 'border-yellow-500 bg-yellow-50';
            case 'danger':
            case 'red':
                return 'border-red-500 bg-red-50';
            default:
                return 'border-gray-300 bg-white';
        }
    };

    const getTextColor = () => {
        switch (status) {
            case 'success':
            case 'green':
                return 'text-green-700';
            case 'warning':
            case 'yellow':
                return 'text-yellow-700';
            case 'danger':
            case 'red':
                return 'text-red-700';
            default:
                return 'text-gray-900';
        }
    };

    const getTrendIcon = () => {
        if (!trend) return null;

        if (trend > 0) {
            return <span className="text-green-600 text-sm ml-2">↑ {trend}%</span>;
        } else if (trend < 0) {
            return <span className="text-red-600 text-sm ml-2">↓ {Math.abs(trend)}%</span>;
        }
        return <span className="text-gray-500 text-sm ml-2">→ 0%</span>;
    };

    return (
        <div className={`rounded-lg border-2 p-6 shadow-sm transition-all hover:shadow-md ${getStatusColor()}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <div className="flex items-baseline">
                        <p className={`text-3xl font-bold ${getTextColor()}`}>
                            {value}
                        </p>
                        {getTrendIcon()}
                    </div>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
                    )}
                </div>
                {icon && (
                    <div className="ml-4 text-gray-400">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

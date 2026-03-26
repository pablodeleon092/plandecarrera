import React from 'react';

export default function StatCard({ title, value, subtext = null, color = 'white' }) {

    const isWarning = color === 'yellow' || color === 'warning' || color === 'red';

    return (
        <div className={`p-5 rounded-lg border shadow-sm flex flex-col justify-between h-full transition-shadow hover:shadow-md ${
            isWarning 
                ? 'bg-amber-50 border-amber-400' 
                : 'bg-white border-gray-200'
        }`}>
            <div>
                {/* 1. Título (arriba, gris y pequeño) */}
                <h3 className={`text-sm font-medium uppercase tracking-wide ${
                    isWarning ? 'text-amber-800' : 'text-gray-500'
                }`}>
                    {title}
                </h3>

                {/* 2. Valor (grande y negrita) */}
                <p className={`text-3xl font-bold mt-2 ${
                    isWarning ? 'text-amber-900' : 'text-gray-900'
                }`}>
                    {value}
                </p>
            </div>

            {/* 3. Subtexto opcional (abajo, para detalles extra) */}
            {subtext && (
                <p className={`text-xs mt-4 ${
                    isWarning ? 'text-amber-700' : 'text-gray-400'
                }`}>
                    {subtext}
                </p>
            )}
        </div>
    );
}
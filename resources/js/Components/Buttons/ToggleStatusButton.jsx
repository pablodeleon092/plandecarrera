import React from 'react';

export default function ToggleStatusButton({ isActive, onClick }) {
    const title = isActive ? 'Desactivar' : 'Activar';
    const colorClasses = isActive
        ? 'text-red-500 hover:text-red-700'
        : 'text-green-500 hover:text-green-700';

    return (
        <button onClick={onClick} className={`transition ${colorClasses}`} title={title}>
            {isActive ? (
                // Ícono para "Desactivar" (Ban)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636">
                    </path>
                </svg>
            ) : (
                // Ícono para "Activar" (Check Circle)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z">
                    </path>
                </svg>
            )}
        </button>
    );
}

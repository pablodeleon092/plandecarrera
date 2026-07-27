import TextInput from '@/Components/TextInput';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function PasswordInput({ className = '', disabled = false, ...props }) {
    const [isVisible, setIsVisible] = useState(false);
    const visibilityLabel = isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña';

    return (
        <div className={`relative ${className}`.trim()}>
            <TextInput
                {...props}
                type={isVisible ? 'text' : 'password'}
                disabled={disabled}
                className="block w-full pr-11"
            />
            <button
                type="button"
                onClick={() => setIsVisible((visible) => !visible)}
                disabled={disabled}
                aria-label={visibilityLabel}
                aria-pressed={isVisible}
                title={visibilityLabel}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-gray-500 transition hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isVisible ? (
                    <EyeSlashIcon aria-hidden="true" className="h-5 w-5" />
                ) : (
                    <EyeIcon aria-hidden="true" className="h-5 w-5" />
                )}
            </button>
        </div>
    );
}

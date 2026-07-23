import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function SearchBar({
    routeName,
    initialValue = '',
    filters = {},
    placeholder = 'Buscar por nombre…',
}) {
    const normalizedInitialValue = initialValue ?? '';
    const [value, setValue] = useState(normalizedInitialValue);

    useEffect(() => {
        setValue(normalizedInitialValue);
    }, [normalizedInitialValue]);

    useEffect(() => {
        if (value === normalizedInitialValue) {
            return undefined;
        }

        const timeout = setTimeout(() => {
            const params = new URLSearchParams();
            const search = value.trim();

            if (search) {
                params.set('search', search);
            }

            (filters.filters || []).forEach((filter, index) => {
                params.append(`filters[${index}][field]`, filter.field);
                params.append(`filters[${index}][operator]`, filter.operator);

                if (typeof filter.value === 'object' && filter.value !== null) {
                    params.append(`filters[${index}][value][min]`, filter.value.min || '');
                    params.append(`filters[${index}][value][max]`, filter.value.max || '');
                } else {
                    params.append(`filters[${index}][value]`, filter.value || '');
                }
            });

            const query = params.toString();
            const url = query
                ? `${route(routeName)}?${query}`
                : route(routeName);

            router.get(url, {}, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timeout);
    }, [filters, normalizedInitialValue, routeName, value]);

    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <label
                htmlFor={`${routeName}-search`}
                className="mb-2 block text-sm font-medium text-gray-700"
            >
                Buscar
            </label>
            <div className="relative">
                <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                >
                    <circle cx="8.5" cy="8.5" r="5.5" />
                    <path strokeLinecap="round" d="m12.5 12.5 4 4" />
                </svg>
                <input
                    id={`${routeName}-search`}
                    type="search"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder={placeholder}
                    className="block w-full rounded-md border-gray-300 py-2 pl-10 pr-3 text-sm shadow-sm transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                />
            </div>
        </div>
    );
}

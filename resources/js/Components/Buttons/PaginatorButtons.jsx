import React from 'react';
import { Link, router } from '@inertiajs/react';

export default function PaginatorButtons({ meta = null, paginator = null, onPageChange = null, routeName = null, routeParams = {}, window = 2 }) {
    // Soporta el objeto 'meta' directo o el objeto 'paginator' completo
    let usedMeta = meta;

    if (!usedMeta && paginator) {
        if (paginator.meta) {
            usedMeta = paginator.meta;
        } else {
            usedMeta = {
                current_page: paginator.current_page ?? paginator.page ?? 1,
                last_page: paginator.last_page ?? paginator.lastPage ?? (paginator.total && paginator.per_page ? Math.max(1, Math.ceil(paginator.total / paginator.per_page)) : 1),
            };
        }
    }

    if (!usedMeta) return null;

    const { current_page, last_page } = usedMeta;

    const goTo = (page) => {
        if (page < 1 || page > last_page) return;
        if (onPageChange) return onPageChange(page);

        const allParams = { ...routeParams, page };
        
        // El método router.get es la forma recomendada para Inertia.
        router.get(route(routeName, allParams), {}, {
            // Aseguramos que la navegación no resetee el estado del componente (como los filtros locales)
            preserveScroll: true,
            preserveState: true,
            replace: true,
  
        });
        
    };

    const pages = [];
    const start = Math.max(1, current_page - window);
    const end = Math.min(last_page, current_page + window);

    // Lógica para mostrar puntos suspensivos o límites si es necesario (mejoras opcionales)

    if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
    }
    
    for (let p = start; p <= end; p++) {
        if (p !== 1 && p !== last_page) pages.push(p);
    }

    if (end < last_page) {
        if (end < last_page - 1) pages.push('...');
        pages.push(last_page);
    }
    
    // Aseguramos que la página actual y la última estén incluidas si están fuera del rango visible
    if (!pages.includes(current_page)) pages.splice(pages.findIndex(p => p > current_page) === -1 ? pages.length -1 : pages.findIndex(p => p > current_page), 0, current_page);
    if (last_page > 1 && !pages.includes(last_page)) pages.push(last_page);
    if (last_page > 1 && !pages.includes(1)) pages.unshift(1);

    // Filtramos duplicados y solo dejamos el último, manteniendo el orden
    const uniquePages = pages.filter((value, index, self) => {
        return self.indexOf(value) === index;
    });
    
    // Si la lista de páginas es demasiado larga, volvemos a la lógica simple para evitar bucles.
    const finalPages = uniquePages.length > 10 ? 
        Array.from({ length: end - start + 1 }, (_, i) => start + i) : uniquePages;


    return (
        <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
                {`Página ${current_page} de ${last_page}`}
            </div>
            <div className="inline-flex items-center space-x-2"> {/* Reducido el espacio a space-x-2 */}
                <button
                    onClick={() => goTo(current_page - 1)}
                    disabled={current_page <= 1}
                    className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                >
                    Anterior
                </button>

                {finalPages.map((p, index) => (
                    p === '...' ? (
                        <span key={index} className="px-3 py-1 text-gray-500">...</span>
                    ) : (
                        <button 
                            key={index}
                            onClick={() => goTo(p)}
                            className={`px-3 py-1 rounded-lg transition ${p === current_page ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-500'}`}
                        >
                            {p}
                        </button>
                    )
                ))}

                <button
                    onClick={() => goTo(current_page + 1)}
                    disabled={current_page >= last_page}
                    className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
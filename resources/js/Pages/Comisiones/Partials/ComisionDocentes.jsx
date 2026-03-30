// Updated ComisionDocentes.jsx using DataTable
import React, { useState, useMemo } from "react";
import { Link, router } from "@inertiajs/react";
import TableFilters from "@/Components/TableFilters";
import DataTable from "@/Components/DataTable";
import DangerButton from "@/Components/Buttons/DangerButton";

export default function ComisionDocentes({ comision, docentes, allDocentes, filters: initialFilters = {} }) {
    const [filters, setFilters] = useState({
        search: initialFilters.search || "",
    });

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const filterConfig = [
        {
            key: "search",
            label: "Buscar",
            type: "text",
            value: filters.search,
            placeholder: "Buscar por nombre, apellido o legajo...",
        },
    ];

    const docentesFiltrados = useMemo(() => {
        const query = filters.search.toLowerCase().trim();
        if (!query) return [];

        return allDocentes.filter((d) => {
            const nombre = d.nombre?.toLowerCase() || "";
            const apellido = d.apellido?.toLowerCase() || "";
            const legajo = d.legajo?.toString() || "";
            return nombre.includes(query) || apellido.includes(query) || legajo.includes(query);
        });
    }, [filters.search, allDocentes]);

    const columns = [
        { key: "nombre", label: "Nombre", render: (d) => `${d.nombre} ${d.apellido}` },
        { key: "cargo", label: "Cargo" },
        { key: "modalidad_presencia", label: "Modalidad" },
        { key: "horas_frente_aula", label: "Horas Frente Aula" },
        { key: "funcion_aulica", label: "Función Aúlica" },
        {
            key: "acciones",
            label: "Acciones",
            render: (d) => (
                <div className="flex items-center space-x-3">
                    <Link href={route("dictas.edit", d.dicta_id)} className="text-blue-600 hover:underline">
                        Editar
                    </Link>

                    <Link href={route("docentes.show", d.id)} className="text-blue-600 hover:underline">
                        Ver
                    </Link>

                    <DangerButton
                        onClick={() => {
                            if (confirm("¿Eliminar docente de esta comisión?")) {
                                router.delete(route("dictas.destroy", d.dicta_id));
                            }
                        }}
                        className="px-3 py-1 text-xs"
                    >
                        Eliminar
                    </DangerButton>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-10">
            {/* LISTADO PRINCIPAL */}
            <div>
                <h3 className="text-2xl font-bold mb-6">Docentes en la comisión</h3>
                <DataTable columns={columns} data={docentes} emptyMessage="No hay docentes en esta comisión" />
            </div>

            {/* BUSCADOR Y AGREGADO */}
            <div>
                <h4 className="text-lg font-semibold mb-2">Agregar docente</h4>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <TableFilters filters={filterConfig} onChange={handleFilterChange} />
                </div>

                {docentesFiltrados.length > 0 && (
                    <ul className="border border-gray-200 rounded-md shadow-sm bg-white max-h-60 overflow-y-auto">
                        {docentesFiltrados.map((docente) => (
                            <li
                                key={docente.id}
                                className="p-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                                onClick={() =>
                                (window.location.href = route("dictas.create", {
                                    comision_id: comision.id,
                                    docente_id: docente.id,
                                }))
                                }
                            >
                                <span>
                                    {docente.nombre} {docente.apellido}
                                </span>
                                <span className="text-sm text-gray-500">Legajo: {docente.legajo || "—"}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

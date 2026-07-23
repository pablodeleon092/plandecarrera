import Button from '@/Components/Button';
import { Head, useForm, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ auth, materia }) {
    const { data, setData, put, processing, errors } = useForm({
        nombre: materia.nombre,
        codigo: materia.codigo,
        estado: materia.estado,
        regimen: materia.regimen,
        cuatrimestre: materia.cuatrimestre || '',
        horas_semanales: materia.horas_semanales,
        horas_totales: materia.horas_totales
    });

    useEffect(() => {
        if (data.horas_semanales && data.regimen) {
            const semanas = data.regimen === 'anual' ? 32 : 16;
            setData('horas_totales', parseInt(data.horas_semanales) * semanas);
        }
    }, [data.horas_semanales, data.regimen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/materias/${materia.id}`);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Editar Materia</h2>}
        >
            <Head title="Editar Materia" />
                    <div className="mb-4">
                        <Button variant="secondary"
                            as={Link}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                window.history.back();
                            }}
                            className="flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Volver
                        </Button>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900">Editar Materia</h1>
                        <p className="text-gray-600 mt-2">Modifique los datos de la materia</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                                Información Básica
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre de la Materia *
                                    </label>
                                    <input
                                        id="nombre"
                                        type="text"
                                        value={data.nombre}
                                        onChange={e => setData('nombre', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nombre ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Ej: Matemática I"
                                    />
                                    {errors.nombre && (
                                        <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-2">
                                        Código *
                                    </label>
                                    <input
                                        id="codigo"
                                        type="text"
                                        value={data.codigo}
                                        onChange={e => setData('codigo', e.target.value.toUpperCase())}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.codigo ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Ej: MAT101"
                                    />
                                    {errors.codigo && (
                                        <p className="text-red-500 text-sm mt-1">{errors.codigo}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
                                        Estado *
                                    </label>
                                    <select
                                        id="estado"
                                        value={data.estado}
                                        onChange={e => setData('estado', e.target.value === 'true')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="true">Activo</option>
                                        <option value="false">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                                Configuración Académica
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="regimen" className="block text-sm font-medium text-gray-700 mb-2">
                                        Régimen *
                                    </label>
                                    <select
                                        id="regimen"
                                        value={data.regimen}
                                        onChange={e => {
                                            setData('regimen', e.target.value);
                                            if (e.target.value === 'anual') {
                                                setData('cuatrimestre', '');
                                            }
                                        }}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.regimen ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="cuatrimestral">Cuatrimestral</option>
                                        <option value="anual">Anual</option>
                                    </select>
                                    {errors.regimen && (
                                        <p className="text-red-500 text-sm mt-1">{errors.regimen}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cuatrimestre {data.regimen === 'cuatrimestral' && '*'}
                                    </label>
                                    <select
                                        value={data.cuatrimestre}
                                        onChange={e => setData('cuatrimestre', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cuatrimestre ? 'border-red-500' : 'border-gray-300'}
                                        ${errors.cuatrimestre ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Seleccione…</option>
                                        <option value="1">1°</option>
                                        <option value="2">2°</option>
                                        <option value="3">3°</option>
                                        <option value="4">4°</option>
                                        <option value="5">5°</option>
                                        <option value="6">6°</option>
                                        <option value="7">7°</option>
                                        <option value="8">8°</option>
                                        <option value="9">9°</option>
                                        <option value="10">10°</option>
                                    </select>
                                    {errors.cuatrimestre && (
                                        <p className="text-red-500 text-sm mt-1">{errors.cuatrimestre}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                                Carga Horaria
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="horas_semanales" className="block text-sm font-medium text-gray-700 mb-2">
                                        Horas Semanales *
                                    </label>
                                    <input
                                        id="horas_semanales"
                                        type="number"
                                        min="1"
                                        max="40"
                                        value={data.horas_semanales}
                                        onChange={e => setData('horas_semanales', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.horas_semanales ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Ej: 4"
                                    />
                                    {errors.horas_semanales && (
                                        <p className="text-red-500 text-sm mt-1">{errors.horas_semanales}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="horas_totales" className="block text-sm font-medium text-gray-700 mb-2">
                                        Horas Totales
                                    </label>
                                    <input
                                        id="horas_totales"
                                        type="number"
                                        value={data.horas_totales}
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                        placeholder="Se calcula automáticamente"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {data.regimen === 'anual' ? '32 semanas' : '16 semanas'} × {data.horas_semanales || 0} horas
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6 border-t">
                            <Button variant="danger"
                                as={Link}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.history.back();
                                }}
                                className="flex-1 justify-center"
                            >
                                Cancelar
                            </Button>
                            <Button variant="primary"
                                type="button"
                                onClick={handleSubmit}
                                disabled={processing}
                                className="flex-1 justify-center"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Actualizando…
                                    </span>
                                ) : 'Actualizar Materia'}
                            </Button>
                        </div>
                    </div>

        </AuthenticatedLayout>
    );
}

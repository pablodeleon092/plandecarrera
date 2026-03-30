import { Head, useForm, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import SecondaryButton from '@/Components/Buttons/SecondaryButton';
import DangerButton from '@/Components/Buttons/DangerButton';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        codigo: '',
        estado: true,
        regimen: 'cuatrimestral',
        cuatrimestre: '',
        horas_semanales: '',
        horas_totales: ''
    });

    // Calcular horas totales automáticamente
    useEffect(() => {
        if (data.horas_semanales && data.regimen) {
            const semanas = data.regimen === 'anual' ? 32 : 16;
            setData('horas_totales', parseInt(data.horas_semanales) * semanas);
        }
    }, [data.horas_semanales, data.regimen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/materias');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Crear Nueva Materia</h2>}
        >
            <Head title="Crear Materia" />
                    {/* Breadcrumb */}
                    <div className="mb-6">
                        <Link
                            href="/materias"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver a Materias
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900">Crear Nueva Materia</h1>
                        <p className="text-gray-600 mt-2">Complete los datos de la nueva materia</p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
                        {/* Información Básica */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                                Información Básica
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Nombre */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre de la Materia *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nombre}
                                        onChange={e => setData('nombre', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Ej: Matemática I"
                                    />
                                    {errors.nombre && (
                                        <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                                    )}
                                </div>

                                {/* Código */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Código *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.codigo}
                                        onChange={e => setData('codigo', e.target.value.toUpperCase())}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.codigo ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Ej: MAT101"
                                    />
                                    {errors.codigo && (
                                        <p className="text-red-500 text-sm mt-1">{errors.codigo}</p>
                                    )}
                                </div>

                                {/* Estado */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estado *
                                    </label>
                                    <select
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

                        {/* Configuración Académica */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                                Configuración Académica
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Régimen */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Régimen *
                                    </label>
                                    <select
                                        value={data.regimen}
                                        onChange={e => {
                                            setData('regimen', e.target.value);
                                            if (e.target.value === 'anual') {
                                                setData('cuatrimestre', '');
                                            }
                                        }}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.regimen ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="cuatrimestral">Cuatrimestral</option>
                                        <option value="anual">Anual</option>
                                    </select>
                                    {errors.regimen && (
                                        <p className="text-red-500 text-sm mt-1">{errors.regimen}</p>
                                    )}
                                </div>

                                {/* Cuatrimestre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cuatrimestre / Año *
                                    </label>
                                    <select
                                        value={data.cuatrimestre}
                                        onChange={e => setData('cuatrimestre', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cuatrimestre ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Seleccione...</option>
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

                        {/* Carga Horaria */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                                Carga Horaria
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Horas Semanales */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Horas Semanales *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="40"
                                        value={data.horas_semanales}
                                        onChange={e => setData('horas_semanales', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.horas_semanales ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Ej: 4"
                                    />
                                    {errors.horas_semanales && (
                                        <p className="text-red-500 text-sm mt-1">{errors.horas_semanales}</p>
                                    )}
                                </div>

                                {/* Horas Totales (calculado automáticamente) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Horas Totales
                                    </label>
                                    <input
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

                        {/* Botones */}
                        <div className="flex gap-4 pt-6 border-t">
                            <DangerButton
                                as={Link}
                                href="/materias"
                                className="flex-1 justify-center"
                            >
                                Cancelar
                            </DangerButton>
                            <PrimaryButton
                                type="submit"
                                disabled={processing}
                                className="flex-1 justify-center"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </span>
                                ) : 'Crear Materia'}
                            </PrimaryButton>
                        </div>
                    </form>

        </AuthenticatedLayout>
    );
}
<?php

namespace App\Services\Dashboards;

use App\Models\Docente;
use App\Models\Comision;
use App\Models\Materia;
use App\Models\Instituto;
use Illuminate\Support\Facades\Auth;

class ConsejeroDashboardService
{
    public function getData($institutoId = null)
    {
        $user = Auth::user();
        $institutosPermitidos = $this->getInstitutosPermitidos($user);

        // Filtros por instituto si se especifica
        $institutoFiltro = $institutoId ?: ($institutosPermitidos->first()?->id ?? null);

        // KPIs principales
        $totalDocentes = Docente::whereHas('instituto', function ($q) use ($institutosPermitidos) {
            $q->whereIn('id', $institutosPermitidos->pluck('id'));
        })->count();

        $totalMaterias = Materia::whereHas('instituto', function ($q) use ($institutosPermitidos) {
            $q->whereIn('id', $institutosPermitidos->pluck('id'));
        })->count();

        $totalComisiones = Comision::whereHas('materia.instituto', function ($q) use ($institutosPermitidos) {
            $q->whereIn('id', $institutosPermitidos->pluck('id'));
        })->count();

        // Alertas
        $alertasSobrecarga = $this->getAlertasSobrecarga($institutosPermitidos);
        $alertasSinCobertura = $this->getAlertasSinCobertura($institutosPermitidos);

        return [
            'institutos' => $institutosPermitidos,
            'kpis' => [
                'totalDocentes' => $totalDocentes,
                'totalMaterias' => $totalMaterias,
                'totalComisiones' => $totalComisiones,
            ],
            'alertas' => [
                'sobrecarga' => $alertasSobrecarga,
                'sinCobertura' => $alertasSinCobertura,
            ],
            'institutoSeleccionado' => $institutoFiltro,
        ];
    }

    private function getInstitutosPermitidos($user)
    {
        // Lógica similar a la del controller original
        if ($user->hasRole('consejero')) {
            return Instituto::where('id', $user->instituto_id)->get();
        }
        // Para otros roles, ajustar según permisos
        return Instituto::all();
    }

    private function getAlertasSobrecarga($institutosPermitidos)
    {
        // Lógica de alertas de sobrecarga (docentes con muchas comisiones)
        return Docente::whereHas('instituto', function ($q) use ($institutosPermitidos) {
            $q->whereIn('id', $institutosPermitidos->pluck('id'));
        })->withCount('comisiones')->having('comisiones_count', '>', 5)->get();
    }

    private function getAlertasSinCobertura($institutosPermitidos)
    {
        // Lógica de alertas de materias sin cobertura
        return Materia::whereDoesntHave('comisiones')->whereHas('instituto', function ($q) use ($institutosPermitidos) {
            $q->whereIn('id', $institutosPermitidos->pluck('id'));
        })->get();
    }
}
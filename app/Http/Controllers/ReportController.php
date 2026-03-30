<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function exportar(Request $request, string $tipo)
    {
        try {
            $service = \App\Factories\ReportFactory::make($tipo);
            $path = $service->generarPdf($request);

            return response()->download($path, "reporte_{$tipo}.pdf")
                            ->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }  
}


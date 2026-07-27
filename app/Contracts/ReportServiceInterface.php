<?php
namespace App\Contracts;

use Illuminate\Http\Request;

interface ReportServiceInterface
{
    public function generarPdf(Request $request): string;
}
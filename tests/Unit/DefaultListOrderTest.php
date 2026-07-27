<?php

namespace Tests\Unit;

use App\Http\Controllers\CarreraController;
use App\Http\Controllers\ComisionController;
use App\Http\Controllers\DocenteController;
use App\Http\Controllers\MateriaController;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;

class DefaultListOrderTest extends TestCase
{
    public function test_materias_default_to_name_without_prioritizing_cuatrimestre(): void
    {
        $source = $this->indexSource(MateriaController::class);

        $this->assertStringContainsString("->orderBy('nombre', 'asc')", $source);
        $this->assertStringNotContainsString("->orderBy('cuatrimestre'", $source);
    }

    public function test_docentes_default_to_last_name_and_then_first_name(): void
    {
        $source = $this->indexSource(DocenteController::class);

        $this->assertStringContainsString(
            "->orderBy('apellido', 'asc') ->orderBy('nombre', 'asc')",
            $source
        );
    }

    public function test_carreras_default_to_name(): void
    {
        $source = $this->indexSource(CarreraController::class);

        $this->assertStringContainsString("->orderBy('nombre', 'asc')", $source);
    }

    public function test_comisiones_default_to_name_instead_of_recency(): void
    {
        $source = $this->indexSource(ComisionController::class);

        $this->assertStringContainsString("->orderBy('nombre', 'asc')", $source);
        $this->assertStringNotContainsString("->orderBy('id', 'desc')", $source);
    }

    private function indexSource(string $controller): string
    {
        $method = new ReflectionMethod($controller, 'index');
        $lines = file($method->getFileName());
        $source = implode('', array_slice(
            $lines,
            $method->getStartLine() - 1,
            $method->getEndLine() - $method->getStartLine() + 1
        ));

        return preg_replace('/\s+/', ' ', $source);
    }
}

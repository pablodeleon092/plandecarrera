<?php

namespace Tests\Feature\Dashboards;

use App\Dashboards\SecretariaDashboard;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use ReflectionMethod;
use Tests\TestCase;

class SecretariaDashboardActiveComisionesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('institutos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
        });

        Schema::create('carreras', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->unsignedBigInteger('instituto_id');
            $table->boolean('estado');
            $table->string('modalidad');
            $table->string('sede');
            $table->timestamps();
        });

        Schema::create('planes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('carrera_id');
            $table->integer('anio_comienzo');
            $table->date('anio_fin')->nullable();
            $table->timestamps();
        });

        Schema::create('materias', function (Blueprint $table) {
            $table->id();
            $table->string('codigo');
            $table->string('nombre');
            $table->boolean('estado');
            $table->string('regimen');
            $table->string('cuatrimestre')->nullable();
            $table->integer('horas_semanales');
            $table->integer('horas_totales');
            $table->timestamps();
        });

        Schema::create('plan_materia', function (Blueprint $table) {
            $table->unsignedBigInteger('plan_id');
            $table->unsignedBigInteger('materia_id');
            $table->integer('anio')->nullable();
        });

        Schema::create('comisiones', function (Blueprint $table) {
            $table->id();
            $table->string('codigo');
            $table->string('nombre');
            $table->string('turno');
            $table->string('modalidad');
            $table->string('sede');
            $table->integer('anio');
            $table->string('cuatrimestre')->nullable();
            $table->integer('horas_teoricas');
            $table->integer('horas_practicas');
            $table->integer('horas_totales');
            $table->boolean('estado');
            $table->unsignedBigInteger('id_materia');
            $table->timestamps();
        });

        Schema::create('docentes', function (Blueprint $table) {
            $table->id();
            $table->string('legajo');
            $table->string('nombre');
            $table->string('apellido');
            $table->boolean('es_activo');
            $table->timestamps();
        });

        Schema::create('cargos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->unsignedBigInteger('docente_id');
            $table->timestamps();
        });

        Schema::create('dictas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comision_id');
            $table->unsignedBigInteger('docente_id');
            $table->unsignedBigInteger('cargo_id');
            $table->timestamps();
        });

        $this->seedDashboardScenario();
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('dictas');
        Schema::dropIfExists('cargos');
        Schema::dropIfExists('docentes');
        Schema::dropIfExists('comisiones');
        Schema::dropIfExists('plan_materia');
        Schema::dropIfExists('materias');
        Schema::dropIfExists('planes');
        Schema::dropIfExists('carreras');
        Schema::dropIfExists('institutos');

        parent::tearDown();
    }

    public function test_secretaria_dashboard_metrics_ignore_inactive_commissions(): void
    {
        $resumen = $this->invokeDashboardMethod('getResumenEjecutivo', ['all']);

        $this->assertSame(1, $resumen['totalComisiones']);
        $this->assertSame(0, $resumen['comisionesConCobertura']);
        $this->assertSame(0.0, $resumen['porcentajeCobertura']);

        $sinCobertura = $this->invokeDashboardMethod('getMateriasSinCobertura', ['all']);

        $this->assertSame([1], array_column($sinCobertura, 'comisionId'));

        $estadisticas = $this->invokeDashboardMethod('getEstadisticasCarreras', ['all']);

        $this->assertCount(1, $estadisticas);
        $this->assertSame(1, $estadisticas[0]['totalComisiones']);
        $this->assertSame(0, $estadisticas[0]['comisionesConCobertura']);
        $this->assertSame(0.0, $estadisticas[0]['porcentajeCobertura']);
    }

    private function seedDashboardScenario(): void
    {
        $year = (int) date('Y');
        $now = now();

        DB::table('institutos')->insert([
            'id' => 1,
            'nombre' => 'Instituto de prueba',
        ]);

        DB::table('carreras')->insert([
            'id' => 1,
            'nombre' => 'Carrera de prueba',
            'instituto_id' => 1,
            'estado' => true,
            'modalidad' => 'presencial',
            'sede' => 'Ushuaia',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('planes')->insert([
            'id' => 1,
            'carrera_id' => 1,
            'anio_comienzo' => $year,
            'anio_fin' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('materias')->insert([
            'id' => 1,
            'codigo' => 'MAT-1',
            'nombre' => 'Materia de prueba',
            'estado' => true,
            'regimen' => 'anual',
            'cuatrimestre' => null,
            'horas_semanales' => 4,
            'horas_totales' => 128,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('plan_materia')->insert([
            'plan_id' => 1,
            'materia_id' => 1,
            'anio' => 1,
        ]);

        DB::table('comisiones')->insert([
            [
                'id' => 1,
                'codigo' => 'ACT-SIN',
                'nombre' => 'Activa sin cobertura',
                'turno' => 'mañana',
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia',
                'anio' => $year,
                'cuatrimestre' => '1ro',
                'horas_teoricas' => 2,
                'horas_practicas' => 2,
                'horas_totales' => 4,
                'estado' => true,
                'id_materia' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'codigo' => 'INA-CUB',
                'nombre' => 'Inactiva con cobertura',
                'turno' => 'tarde',
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia',
                'anio' => $year,
                'cuatrimestre' => '1ro',
                'horas_teoricas' => 2,
                'horas_practicas' => 2,
                'horas_totales' => 4,
                'estado' => false,
                'id_materia' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'codigo' => 'INA-SIN',
                'nombre' => 'Inactiva sin cobertura',
                'turno' => 'noche',
                'modalidad' => 'virtual',
                'sede' => 'Río Grande',
                'anio' => $year,
                'cuatrimestre' => '2do',
                'horas_teoricas' => 2,
                'horas_practicas' => 2,
                'horas_totales' => 4,
                'estado' => false,
                'id_materia' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        DB::table('docentes')->insert([
            'id' => 1,
            'legajo' => '100',
            'nombre' => 'Docente',
            'apellido' => 'Cubierto',
            'es_activo' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('cargos')->insert([
            'id' => 1,
            'nombre' => 'Titular',
            'docente_id' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('dictas')->insert([
            'id' => 1,
            'comision_id' => 2,
            'docente_id' => 1,
            'cargo_id' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    private function invokeDashboardMethod(string $method, array $arguments): mixed
    {
        $reflection = new ReflectionMethod(SecretariaDashboard::class, $method);
        $reflection->setAccessible(true);

        return $reflection->invokeArgs(new SecretariaDashboard(), $arguments);
    }
}

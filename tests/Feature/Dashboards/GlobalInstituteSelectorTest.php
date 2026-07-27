<?php

namespace Tests\Feature\Dashboards;

use App\Dashboards\DefaultDashboard;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Carrera;
use App\Models\Instituto;
use App\Models\Materia;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use ReflectionMethod;
use Tests\TestCase;

class GlobalInstituteSelectorTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('dni')->unique();
            $table->string('nombre');
            $table->string('apellido');
            $table->boolean('is_activo')->default(true);
            $table->string('cargo');
            $table->unsignedBigInteger('instituto_id')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('institutos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('siglas');
            $table->timestamps();
        });

        Schema::create('carreras', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->unsignedBigInteger('instituto_id');
            $table->string('modalidad');
            $table->string('sede');
            $table->boolean('estado')->default(true);
            $table->timestamps();
        });

        Schema::create('planes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('carrera_id');
            $table->date('anio_comienzo');
            $table->date('anio_fin')->nullable();
            $table->timestamps();
        });

        Schema::create('materias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('codigo')->unique();
            $table->boolean('estado')->default(true);
            $table->string('regimen');
            $table->integer('cuatrimestre')->nullable();
            $table->integer('horas_semanales');
            $table->integer('horas_totales');
            $table->timestamps();
        });

        Schema::create('plan_materia', function (Blueprint $table) {
            $table->unsignedBigInteger('plan_id');
            $table->unsignedBigInteger('materia_id');
            $table->integer('anio')->nullable();
        });

        $this->withoutMiddleware(HandleInertiaRequests::class);
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('plan_materia');
        Schema::dropIfExists('materias');
        Schema::dropIfExists('planes');
        Schema::dropIfExists('carreras');
        Schema::dropIfExists('institutos');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_global_user_defaults_to_all_institutes_and_preserves_explicit_selection(): void
    {
        [$admin] = $this->scenario();

        $this->actingAs($admin)
            ->get(route('dashboard', ['view' => 'selector-test']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Gestion/Dashboard')
                ->where('selectedInstitutoId', 'all')
                ->where('canViewAllInstitutos', true));

        $this->actingAs($admin)
            ->get(route('dashboard', [
                'view' => 'selector-test',
                'instituto_id' => 'all',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('selectedInstitutoId', 'all'));
    }

    public function test_global_materia_query_includes_records_from_every_institute(): void
    {
        [$admin, $materias] = $this->scenario();
        $method = new ReflectionMethod(DefaultDashboard::class, 'getMateriasFiltradasQuery');

        $query = $method->invoke(
            new DefaultDashboard(),
            'all',
            'all',
            $admin
        );

        $this->assertEqualsCanonicalizing(
            $materias->pluck('id')->all(),
            $query->pluck('materias.id')->all()
        );
    }

    public function test_dashboard_component_supports_the_global_option_without_parsing_it_as_a_number(): void
    {
        $component = file_get_contents(
            resource_path('js/Pages/Gestion/Dashboard.jsx')
        );

        $this->assertStringContainsString('CARGOS_CON_VISTA_GLOBAL', $component);
        $this->assertStringContainsString('rawValue === \'all\'', $component);
        $this->assertStringContainsString('<option value="all">Todos los institutos</option>', $component);
    }

    private function scenario(): array
    {
        $admin = User::create([
            'name' => 'admin',
            'email' => 'admin@example.com',
            'password' => 'password',
            'dni' => '10000001',
            'nombre' => 'Administrador',
            'apellido' => 'Sistema',
            'cargo' => 'Administrador',
            'instituto_id' => null,
        ]);

        $materias = collect();

        foreach ([
            ['nombre' => 'Instituto Norte', 'siglas' => 'IN', 'materia' => 'Álgebra'],
            ['nombre' => 'Instituto Sur', 'siglas' => 'IS', 'materia' => 'Biología'],
        ] as $index => $data) {
            $instituto = Instituto::create([
                'nombre' => $data['nombre'],
                'siglas' => $data['siglas'],
            ]);
            $carrera = Carrera::create([
                'nombre' => "Carrera {$data['siglas']}",
                'instituto_id' => $instituto->id,
                'modalidad' => 'presencial',
                'sede' => 'Ushuaia',
            ]);
            $plan = Plan::create([
                'carrera_id' => $carrera->id,
                'anio_comienzo' => '2026-01-01',
            ]);
            $materia = Materia::create([
                'nombre' => $data['materia'],
                'codigo' => "MAT{$index}",
                'estado' => true,
                'regimen' => 'anual',
                'cuatrimestre' => 1,
                'horas_semanales' => 4,
                'horas_totales' => 128,
            ]);
            $plan->materias()->attach($materia->id, ['anio' => 1]);
            $materias->push($materia);
        }

        return [$admin, $materias];
    }
}

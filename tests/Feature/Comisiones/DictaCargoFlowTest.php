<?php

namespace Tests\Feature\Comisiones;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Comision;
use App\Models\Dedicacion;
use App\Models\Dicta;
use App\Models\Docente;
use App\Models\FuncionAulica;
use App\Models\Materia;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class DictaCargoFlowTest extends TestCase
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

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('guard_name');
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('guard_name');
            $table->timestamps();
        });

        Schema::create('model_has_roles', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
        });

        Schema::create('model_has_permissions', function (Blueprint $table) {
            $table->unsignedBigInteger('permission_id');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
        });

        Schema::create('role_has_permissions', function (Blueprint $table) {
            $table->unsignedBigInteger('permission_id');
            $table->unsignedBigInteger('role_id');
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

        Schema::create('comisiones', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->string('nombre');
            $table->string('turno');
            $table->string('modalidad');
            $table->string('sede');
            $table->integer('anio');
            $table->string('cuatrimestre');
            $table->integer('horas_teoricas');
            $table->integer('horas_practicas');
            $table->integer('horas_totales');
            $table->boolean('estado');
            $table->foreignId('id_materia')->constrained('materias');
            $table->timestamps();
        });

        Schema::create('docentes', function (Blueprint $table) {
            $table->id();
            $table->integer('legajo');
            $table->string('nombre');
            $table->string('apellido');
            $table->string('modalidad_desempeño');
            $table->integer('carga_horaria');
            $table->boolean('es_activo');
            $table->string('telefono')->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
        });

        Schema::create('dedicaciones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->integer('horas_frente_aula_min');
            $table->integer('horas_frente_aula_max');
            $table->integer('nro_materias_max');
            $table->timestamps();
        });

        Schema::create('cargos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->foreignId('dedicacion_id')->constrained('dedicaciones');
            $table->integer('nro_materias_asig');
            $table->integer('sum_horas_frente_aula');
            $table->foreignId('docente_id')->constrained('docentes');
            $table->timestamps();
        });

        Schema::create('funciones_aulicas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique();
            $table->timestamps();
        });

        Schema::create('dictas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('docente_id')->constrained('docentes');
            $table->foreignId('cargo_id')->constrained('cargos');
            $table->foreignId('comision_id')->constrained('comisiones');
            $table->date('ano_inicio');
            $table->date('año_fin')->nullable();
            $table->foreignId('funcion_aulica_id')->nullable()->constrained('funciones_aulicas');
            $table->string('modalidad_presencia');
            $table->integer('horas_frente_aula');
            $table->timestamps();
        });

        Gate::before(fn () => true);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->withoutMiddleware(HandleInertiaRequests::class);
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('dictas');
        Schema::dropIfExists('funciones_aulicas');
        Schema::dropIfExists('cargos');
        Schema::dropIfExists('dedicaciones');
        Schema::dropIfExists('docentes');
        Schema::dropIfExists('comisiones');
        Schema::dropIfExists('materias');
        Schema::dropIfExists('role_has_permissions');
        Schema::dropIfExists('model_has_permissions');
        Schema::dropIfExists('model_has_roles');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_teacher_without_positions_is_sent_to_create_one_before_assignment(): void
    {
        [$user, $docente, $comision] = $this->createScenario();

        $this->actingAs($user)
            ->get(route('dictas.create', [
                'comision_id' => $comision->id,
                'docente_id' => $docente->id,
            ]))
            ->assertRedirect(route('docentes.cargo.create', [
                'docente' => $docente,
                'comision_id' => $comision->id,
            ]))
            ->assertSessionHas('error');
    }

    public function test_new_position_returns_to_the_pending_commission_assignment(): void
    {
        [$user, $docente, $comision] = $this->createScenario();
        $dedicacion = Dedicacion::create([
            'nombre' => 'Simple',
            'horas_frente_aula_min' => 0,
            'horas_frente_aula_max' => 10,
            'nro_materias_max' => 2,
        ]);

        $this->actingAs($user)
            ->post(route('cargos.store'), [
                'cargo' => 'Titular',
                'dedicacion_id' => $dedicacion->id,
                'docente_id' => $docente->id,
                'comision_id' => $comision->id,
            ])
            ->assertRedirect(route('dictas.create', [
                'comision_id' => $comision->id,
                'docente_id' => $docente->id,
            ]));

        $this->assertDatabaseHas('cargos', [
            'docente_id' => $docente->id,
            'nombre' => 'Titular',
        ]);
    }

    public function test_assignment_uses_the_commission_modality_instead_of_the_submitted_value(): void
    {
        [$user, $docente, $comision] = $this->createScenario();
        [$cargo, $funcionAulica] = $this->createAssignmentDependencies($docente);

        $this->actingAs($user)
            ->post(route('dictas.store'), [
                'comision_id' => $comision->id,
                'docente_id' => $docente->id,
                'cargo_id' => $cargo->id,
                'horas_frente_aula' => 4,
                'modalidad_presencia' => 'virtual',
                'ano_inicio' => '2026-03-15',
                'año_fin' => '2026-10-10',
                'funcion_aulica_id' => $funcionAulica->id,
            ])
            ->assertRedirect(route('comisiones.show', $comision));

        $this->assertDatabaseHas('dictas', [
            'comision_id' => $comision->id,
            'docente_id' => $docente->id,
            'modalidad_presencia' => 'presencial',
            'ano_inicio' => '2026-01-01',
            'año_fin' => '2026-08-01',
        ]);
    }

    public function test_updating_an_assignment_keeps_the_commission_modality(): void
    {
        [$user, $docente, $comision] = $this->createScenario();
        [$cargo, $funcionAulica] = $this->createAssignmentDependencies($docente);
        $dicta = Dicta::create([
            'comision_id' => $comision->id,
            'docente_id' => $docente->id,
            'cargo_id' => $cargo->id,
            'horas_frente_aula' => 4,
            'modalidad_presencia' => 'virtual',
            'ano_inicio' => '2026-01-01',
            'funcion_aulica_id' => $funcionAulica->id,
        ]);

        $this->actingAs($user)
            ->put(route('dictas.update', $dicta), [
                'comision_id' => $comision->id,
                'docente_id' => $docente->id,
                'cargo_id' => $cargo->id,
                'horas_frente_aula' => 4,
                'modalidad_presencia' => 'mixta',
                'ano_inicio' => '2026-03-15',
                'año_fin' => '2026-10-10',
                'funcion_aulica_id' => $funcionAulica->id,
            ])
            ->assertRedirect(route('comisiones.show', $comision));

        $this->assertDatabaseHas('dictas', [
            'id' => $dicta->id,
            'modalidad_presencia' => 'presencial',
            'ano_inicio' => '2026-01-01',
            'año_fin' => '2026-08-01',
        ]);
    }

    public function test_annual_assignment_uses_the_full_calendar_year(): void
    {
        [$user, $docente, $comision] = $this->createScenario();
        $comision->materia()->update(['regimen' => 'anual']);
        [$cargo, $funcionAulica] = $this->createAssignmentDependencies($docente);

        $this->actingAs($user)
            ->post(route('dictas.store'), [
                'comision_id' => $comision->id,
                'docente_id' => $docente->id,
                'cargo_id' => $cargo->id,
                'horas_frente_aula' => 4,
                'funcion_aulica_id' => $funcionAulica->id,
            ])
            ->assertRedirect(route('comisiones.show', $comision));

        $this->assertDatabaseHas('dictas', [
            'comision_id' => $comision->id,
            'ano_inicio' => '2026-01-01',
            'año_fin' => '2026-12-31',
        ]);
    }

    public function test_second_term_assignment_runs_from_august_to_december(): void
    {
        [$user, $docente, $comision] = $this->createScenario();
        $comision->update(['cuatrimestre' => '2do']);
        [$cargo, $funcionAulica] = $this->createAssignmentDependencies($docente);

        $this->actingAs($user)
            ->post(route('dictas.store'), [
                'comision_id' => $comision->id,
                'docente_id' => $docente->id,
                'cargo_id' => $cargo->id,
                'horas_frente_aula' => 4,
                'ano_inicio' => '2026-03-15',
                'año_fin' => '2026-10-10',
                'funcion_aulica_id' => $funcionAulica->id,
            ])
            ->assertRedirect(route('comisiones.show', $comision));

        $this->assertDatabaseHas('dictas', [
            'comision_id' => $comision->id,
            'ano_inicio' => '2026-08-01',
            'año_fin' => '2026-12-31',
        ]);
    }

    private function createAssignmentDependencies(Docente $docente): array
    {
        $dedicacion = Dedicacion::create([
            'nombre' => 'Simple',
            'horas_frente_aula_min' => 0,
            'horas_frente_aula_max' => 10,
            'nro_materias_max' => 2,
        ]);
        $cargo = $docente->cargos()->create([
            'nombre' => 'Titular',
            'dedicacion_id' => $dedicacion->id,
            'nro_materias_asig' => 0,
            'sum_horas_frente_aula' => 0,
        ]);
        $funcionAulica = FuncionAulica::create([
            'nombre' => 'teorica/practica',
        ]);

        return [$cargo, $funcionAulica];
    }

    private function createScenario(): array
    {
        $user = User::create([
            'name' => 'secretaria',
            'email' => 'secretaria@example.com',
            'password' => 'password',
            'dni' => '10000001',
            'nombre' => 'Secretaria',
            'apellido' => 'Academica',
            'cargo' => 'Administrativo de Secretaria Academica',
        ]);

        $materia = Materia::create([
            'nombre' => 'Álgebra 1',
            'codigo' => 'ALG1',
            'estado' => true,
            'regimen' => 'cuatrimestral',
            'cuatrimestre' => 1,
            'horas_semanales' => 4,
            'horas_totales' => 64,
        ]);

        $comision = Comision::create([
            'codigo' => 'ALG1-TM',
            'nombre' => 'Álgebra 1 TMPres',
            'turno' => 'mañana',
            'modalidad' => 'presencial',
            'sede' => 'Ushuaia',
            'anio' => 2026,
            'cuatrimestre' => '1ro',
            'horas_teoricas' => 4,
            'horas_practicas' => 4,
            'horas_totales' => 8,
            'estado' => true,
            'id_materia' => $materia->id,
        ]);

        $docente = Docente::create([
            'legajo' => 123456,
            'nombre' => 'Claudio',
            'apellido' => 'Nashe',
            'modalidad_desempeño' => 'Desarrollo',
            'carga_horaria' => 0,
            'es_activo' => true,
        ]);

        return [$user, $docente, $comision];
    }
}

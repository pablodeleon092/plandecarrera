<?php

namespace Tests\Feature\Carreras;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Carrera;
use App\Models\Instituto;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class EditCarreraTest extends TestCase
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

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('guard_name');
            $table->timestamps();
            $table->unique(['name', 'guard_name']);
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('guard_name');
            $table->timestamps();
            $table->unique(['name', 'guard_name']);
        });

        Schema::create('model_has_roles', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->primary(['role_id', 'model_id', 'model_type']);
        });

        Schema::create('model_has_permissions', function (Blueprint $table) {
            $table->unsignedBigInteger('permission_id');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->primary(['permission_id', 'model_id', 'model_type']);
        });

        Schema::create('role_has_permissions', function (Blueprint $table) {
            $table->unsignedBigInteger('permission_id');
            $table->unsignedBigInteger('role_id');
            $table->primary(['permission_id', 'role_id']);
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Permission::create([
            'name' => 'modificar_carrera',
            'guard_name' => 'web',
        ]);

        $this->withoutMiddleware(HandleInertiaRequests::class);
    }

    protected function tearDown(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Schema::dropIfExists('role_has_permissions');
        Schema::dropIfExists('model_has_permissions');
        Schema::dropIfExists('model_has_roles');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('plan_materia');
        Schema::dropIfExists('materias');
        Schema::dropIfExists('planes');
        Schema::dropIfExists('carreras');
        Schema::dropIfExists('institutos');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_edit_route_renders_career_fields_instead_of_plan_assignment(): void
    {
        [$admin, $carrera] = $this->careerFixture();

        $this->actingAs($admin)
            ->get(route('carreras.edit', $carrera))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Carreras/Edit')
                ->where('carrera.nombre', 'Contador Público')
                ->has('institutos', 1)
                ->missing('plan')
                ->missing('materiasEnPlan'));
    }

    public function test_update_route_changes_career_fields_without_requiring_plan_data(): void
    {
        [$admin, $carrera, $instituto] = $this->careerFixture();

        $this->actingAs($admin)
            ->put(route('carreras.update', $carrera), [
                'nombre' => 'Contador Público Nacional',
                'modalidad' => 'virtual',
                'sede' => 'Rio Grande',
                'instituto_id' => $instituto->id,
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('carreras.index'));

        $this->assertDatabaseHas('carreras', [
            'id' => $carrera->id,
            'nombre' => 'Contador Público Nacional',
            'modalidad' => 'virtual',
            'sede' => 'Rio Grande',
            'instituto_id' => $instituto->id,
        ]);
    }

    public function test_plan_editor_uses_its_own_route_and_component(): void
    {
        [$admin, $carrera] = $this->careerFixture();
        $plan = $carrera->planes()->create([
            'anio_comienzo' => '2026-01-01',
            'anio_fin' => null,
        ]);

        $this->actingAs($admin)
            ->get(route('planes.edit', $plan))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Carreras/EditPlan')
                ->where('carrera.id', $carrera->id)
                ->where('plan.id', $plan->id));
    }

    private function careerFixture(): array
    {
        $instituto = Instituto::create([
            'nombre' => 'Instituto de Desarrollo Económico e Innovación',
            'siglas' => 'IDEI',
        ]);

        $admin = User::create([
            'name' => 'admin-carreras',
            'email' => 'admin-carreras@example.com',
            'password' => 'Clave-segura-123',
            'dni' => '30000001',
            'nombre' => 'Admin',
            'apellido' => 'Carreras',
            'is_activo' => true,
            'cargo' => 'Administrador',
            'instituto_id' => null,
        ]);
        $admin->givePermissionTo('modificar_carrera');

        $carrera = Carrera::create([
            'nombre' => 'Contador Público',
            'modalidad' => 'presencial',
            'sede' => 'Ushuaia',
            'instituto_id' => $instituto->id,
        ]);

        return [$admin, $carrera, $instituto];
    }
}

<?php

namespace Tests\Feature\Docentes;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Dedicacion;
use App\Models\Docente;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class SecretariaDocenteRestrictionsTest extends TestCase
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

        Schema::create('docentes', function (Blueprint $table) {
            $table->id();
            $table->integer('legajo')->unique();
            $table->string('nombre');
            $table->string('apellido');
            $table->string('modalidad_desempeño');
            $table->integer('carga_horaria');
            $table->boolean('es_activo');
            $table->string('telefono')->nullable();
            $table->string('email')->nullable()->unique();
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
            $table->unsignedBigInteger('dedicacion_id');
            $table->integer('nro_materias_asig');
            $table->integer('sum_horas_frente_aula');
            $table->unsignedBigInteger('docente_id');
            $table->timestamps();
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permission = Permission::create([
            'name' => 'modificar_docente',
            'guard_name' => 'web',
        ]);

        $secretariaRole = Role::create([
            'name' => 'Admin_global',
            'guard_name' => 'web',
        ]);
        $secretariaRole->givePermissionTo($permission);

        $institutoRole = Role::create([
            'name' => 'Admin_instituto',
            'guard_name' => 'web',
        ]);
        $institutoRole->givePermissionTo($permission);

        Role::create([
            'name' => 'Admin',
            'guard_name' => 'web',
        ]);

        $this->withoutMiddleware(HandleInertiaRequests::class);
    }

    protected function tearDown(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Schema::dropIfExists('cargos');
        Schema::dropIfExists('dedicaciones');
        Schema::dropIfExists('docentes');
        Schema::dropIfExists('role_has_permissions');
        Schema::dropIfExists('model_has_permissions');
        Schema::dropIfExists('model_has_roles');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_secretaria_can_edit_a_docente_but_cannot_edit_legajo_or_manage_cargos(): void
    {
        [$secretaria, $docente] = $this->scenario();

        $this->actingAs($secretaria)
            ->get(route('docentes.edit', $docente))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Docentes/Edit')
                ->where('can.editLegajo', false)
                ->where('can.manageCargos', false));
    }

    public function test_secretaria_cannot_change_the_legajo_but_can_update_other_docente_data(): void
    {
        [$secretaria, $docente] = $this->scenario();

        $this->actingAs($secretaria)
            ->put(route('docentes.update', $docente), $this->validPayload([
                'legajo' => 999999,
                'nombre' => 'Nombre rechazado',
            ]))
            ->assertSessionHasErrors('legajo');

        $docente->refresh();
        $this->assertSame(123456, $docente->legajo);
        $this->assertSame('Claudio', $docente->nombre);

        $this->actingAs($secretaria)
            ->put(route('docentes.update', $docente), $this->validPayload([
                'nombre' => 'Christian',
            ]))
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('docentes.index'));

        $this->assertDatabaseHas('docentes', [
            'id' => $docente->id,
            'legajo' => 123456,
            'nombre' => 'Christian',
        ]);
    }

    public function test_secretaria_gets_forbidden_when_accessing_or_submitting_cargo_creation(): void
    {
        [$secretaria, $docente] = $this->scenario();
        $dedicacion = Dedicacion::create([
            'nombre' => 'Simple',
            'horas_frente_aula_min' => 0,
            'horas_frente_aula_max' => 10,
            'nro_materias_max' => 2,
        ]);

        $this->actingAs($secretaria)
            ->get(route('docentes.cargo.create', $docente))
            ->assertForbidden();

        $this->actingAs($secretaria)
            ->post(route('cargos.store'), [
                'cargo' => 'Titular',
                'dedicacion_id' => $dedicacion->id,
                'docente_id' => $docente->id,
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('cargos', 0);
    }

    public function test_restrictions_do_not_remove_existing_capabilities_from_other_authorized_roles(): void
    {
        [$user, $docente] = $this->scenario();
        $user->syncRoles('Admin_instituto');

        $this->actingAs($user)
            ->get(route('docentes.edit', $docente))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('can.editLegajo', true)
                ->where('can.manageCargos', true));

        $this->actingAs($user)
            ->put(route('docentes.update', $docente), $this->validPayload([
                'legajo' => 654321,
            ]))
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('docentes.index'));

        $this->assertDatabaseHas('docentes', [
            'id' => $docente->id,
            'legajo' => 654321,
        ]);
    }

    public function test_edit_component_hides_cargo_action_and_locks_legajo_from_permissions(): void
    {
        $component = file_get_contents(
            resource_path('js/Pages/Docentes/Edit.jsx')
        );

        $this->assertStringContainsString('readOnly={!can?.editLegajo}', $component);
        $this->assertStringContainsString('can?.manageCargos ? (', $component);
    }

    private function scenario(): array
    {
        $secretaria = User::create([
            'name' => 'secretaria',
            'email' => 'secretaria@example.com',
            'password' => 'password',
            'dni' => '10000001',
            'nombre' => 'Secretaria',
            'apellido' => 'Academica',
            'cargo' => 'Administrativo de Secretaria Academica',
        ]);
        $secretaria->assignRole('Admin_global');

        $docente = Docente::create([
            'legajo' => 123456,
            'nombre' => 'Claudio',
            'apellido' => 'Nashe',
            'modalidad_desempeño' => 'Desarrollo',
            'carga_horaria' => 0,
            'es_activo' => true,
            'telefono' => '123456',
            'email' => 'claudio@example.com',
        ]);

        return [$secretaria, $docente];
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'legajo' => 123456,
            'nombre' => 'Claudio',
            'apellido' => 'Nashe',
            'modalidad_desempeño' => 'Desarrollo',
            'carga_horaria' => 0,
            'es_activo' => true,
            'telefono' => '123456',
            'email' => 'claudio@example.com',
        ], $overrides);
    }
}

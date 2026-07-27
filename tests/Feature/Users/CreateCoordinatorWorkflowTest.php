<?php

namespace Tests\Feature\Users;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Carrera;
use App\Models\Instituto;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class CreateCoordinatorWorkflowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
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

        Schema::create('coordinador_carreras', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('carrera_id');
            $table->timestamps();
            $table->unique(['user_id', 'carrera_id']);
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

        Role::create(['name' => 'Admin', 'guard_name' => 'web']);
        Role::create(['name' => 'Coord_carrera', 'guard_name' => 'web']);

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
        Schema::dropIfExists('coordinador_carreras');
        Schema::dropIfExists('carreras');
        Schema::dropIfExists('institutos');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_coordinator_is_not_created_before_careers_are_assigned(): void
    {
        [$admin, $instituto] = $this->workflowFixture();

        $this->actingAs($admin)
            ->post(route('users.store'), $this->coordinatorPayload($instituto))
            ->assertRedirect('/users/create/carreras')
            ->assertSessionHas('pending_coordinator');

        $this->assertDatabaseMissing('users', [
            'email' => 'coordinador.nuevo@example.com',
        ]);

        $this->actingAs($admin)
            ->get(route('users.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Users/Auth/Register')
                ->where('pendingUser.email', 'coordinador.nuevo@example.com')
                ->where('pendingUser.cargo', 'Coordinador de Carrera')
                ->missing('pendingUser.password'));

        $this->assertDatabaseMissing('users', [
            'email' => 'coordinador.nuevo@example.com',
        ]);
    }

    public function test_pending_assignment_screen_lists_careers_without_an_existing_user(): void
    {
        [$admin, $instituto, $carrera] = $this->workflowFixture();
        $this->startCoordinatorCreation($admin, $instituto);

        $this->actingAs($admin)
            ->get('/users/create/carreras')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Users/AsignarCarrerasCoordinador')
                ->where('creationMode', true)
                ->where('coordinador.nombre', 'Coordinadora')
                ->where('coordinador.apellido', 'Pendiente')
                ->missing('coordinador.id')
                ->has('carrerasAsignadas', 0)
                ->has('carrerasRestantes', 1)
                ->where('carrerasRestantes.0.id', $carrera->id));

        $this->assertDatabaseMissing('users', [
            'email' => 'coordinador.nuevo@example.com',
        ]);
    }

    public function test_at_least_one_career_is_required_to_create_the_coordinator(): void
    {
        [$admin, $instituto] = $this->workflowFixture();
        $this->startCoordinatorCreation($admin, $instituto);

        $this->actingAs($admin)
            ->from('/users/create/carreras')
            ->post('/users/create/carreras', ['carreras_ids' => []])
            ->assertRedirect('/users/create/carreras')
            ->assertSessionHasErrors('carreras_ids');

        $this->assertDatabaseMissing('users', [
            'email' => 'coordinador.nuevo@example.com',
        ]);
    }

    public function test_saving_the_assignment_creates_the_user_role_and_careers_atomically(): void
    {
        [$admin, $instituto, $carrera] = $this->workflowFixture();
        $this->startCoordinatorCreation($admin, $instituto);

        $response = $this->actingAs($admin)
            ->post('/users/create/carreras', [
                'carreras_ids' => [$carrera->id],
            ])
            ->assertSessionHasNoErrors()
            ->assertSessionMissing('pending_coordinator');

        $coordinador = User::where('email', 'coordinador.nuevo@example.com')->firstOrFail();

        $response->assertRedirect(route('users.show', $coordinador));
        $this->assertTrue(Hash::check('Clave-segura-123', $coordinador->password));
        $this->assertTrue($coordinador->hasRole('Coord_carrera'));
        $this->assertDatabaseHas('coordinador_carreras', [
            'user_id' => $coordinador->id,
            'carrera_id' => $carrera->id,
        ]);
    }

    public function test_pending_assignment_component_has_a_back_link_to_user_creation(): void
    {
        $component = file_get_contents(
            resource_path('js/Pages/Users/AsignarCarrerasCoordinador.jsx')
        );

        $this->assertStringContainsString("href={route('users.create')}", $component);
        $this->assertStringContainsString('Volver atrás', $component);
    }

    private function workflowFixture(): array
    {
        $admin = User::create([
            'name' => 'admin',
            'email' => 'admin@example.com',
            'password' => 'Clave-segura-123',
            'dni' => '10000001',
            'nombre' => 'Admin',
            'apellido' => 'Sistema',
            'is_activo' => true,
            'cargo' => 'Administrador',
            'instituto_id' => null,
        ]);
        $admin->assignRole('Admin');

        $instituto = Instituto::create([
            'nombre' => 'Instituto de Desarrollo',
            'siglas' => 'IDEI',
        ]);

        $carrera = Carrera::create([
            'nombre' => 'Ingeniería Industrial',
            'instituto_id' => $instituto->id,
            'modalidad' => 'presencial',
            'sede' => 'Ushuaia',
        ]);

        return [$admin, $instituto, $carrera];
    }

    private function coordinatorPayload(Instituto $instituto): array
    {
        return [
            'name' => 'coordinador-nuevo',
            'email' => 'COORDINADOR.NUEVO@EXAMPLE.COM',
            'dni' => '10000002',
            'nombre' => 'Coordinadora',
            'apellido' => 'Pendiente',
            'cargo' => 'Coordinador de Carrera',
            'password' => 'Clave-segura-123',
            'password_confirmation' => 'Clave-segura-123',
            'instituto_id' => $instituto->id,
        ];
    }

    private function startCoordinatorCreation(User $admin, Instituto $instituto): void
    {
        $this->actingAs($admin)
            ->post(route('users.store'), $this->coordinatorPayload($instituto));
    }
}

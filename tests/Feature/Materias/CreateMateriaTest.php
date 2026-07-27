<?php

namespace Tests\Feature\Materias;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class CreateMateriaTest extends TestCase
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

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Permission::create([
            'name' => 'crear_materia',
            'guard_name' => 'web',
        ]);

        $this->withoutMiddleware(HandleInertiaRequests::class);
    }

    protected function tearDown(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Schema::dropIfExists('materias');
        Schema::dropIfExists('role_has_permissions');
        Schema::dropIfExists('model_has_permissions');
        Schema::dropIfExists('model_has_roles');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_secretaria_can_create_a_materia_without_an_unavailable_carrera_field(): void
    {
        $secretaria = User::create([
            'name' => 'secretaria',
            'email' => 'secretaria@example.com',
            'password' => 'Clave-segura-123',
            'dni' => '10000001',
            'nombre' => 'Secretaria',
            'apellido' => 'Academica',
            'is_activo' => true,
            'cargo' => 'Administrativo de Secretaria Academica',
            'instituto_id' => 1,
        ]);
        $secretaria->givePermissionTo('crear_materia');

        $response = $this->actingAs($secretaria)
            ->from(route('materias.create'))
            ->post(route('materias.store'), [
                'nombre' => 'Algebra I',
                'codigo' => 'MAT101',
                'estado' => true,
                'regimen' => 'cuatrimestral',
                'cuatrimestre' => 1,
                'horas_semanales' => 4,
                'horas_totales' => 64,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('materias.index'));

        $this->assertDatabaseHas('materias', [
            'nombre' => 'Algebra I',
            'codigo' => 'MAT101',
            'horas_totales' => 64,
        ]);
    }
}

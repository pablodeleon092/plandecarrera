<?php

namespace Tests\Feature\Users;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class UpdateUserPasswordTest extends TestCase
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
            $table->string('siglas');
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

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Role::create([
            'name' => 'Admin',
            'guard_name' => 'web',
        ]);

        Role::create([
            'name' => 'Admin_global',
            'guard_name' => 'web',
        ]);

        foreach (['crear_usuario', 'consultar_usuario', 'modificar_usuario', 'restore_usuario'] as $permission) {
            Permission::create([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

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
        Schema::dropIfExists('institutos');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_general_update_does_not_require_or_change_the_password(): void
    {
        $admin = $this->createAdministrator();
        $user = $this->createUser('usuario@example.com', '10000002');
        $originalPassword = $user->password;

        $this->actingAs($admin)
            ->from(route('users.edit', $user))
            ->put(route('users.update', $user), $this->validUserPayload())
            ->assertRedirect(route('users.index'))
            ->assertSessionHasNoErrors();

        $this->assertSame($originalPassword, $user->refresh()->password);
    }

    public function test_general_update_returns_to_the_user_profile_when_it_was_the_origin(): void
    {
        $admin = $this->createAdministrator();
        $user = $this->createUser('usuario@example.com', '10000002');

        $this->actingAs($admin)
            ->withHeader('X-Inertia', 'true')
            ->put(route('users.update', $user), $this->validUserPayload([
                'return_to' => 'show',
            ]))
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', route('users.show', $user))
            ->assertSessionHasNoErrors();
    }

    public function test_general_inertia_update_forces_a_fresh_user_list_visit(): void
    {
        $admin = $this->createAdministrator();
        $user = $this->createUser('usuario@example.com', '10000002');

        $this->actingAs($admin)
            ->withHeader('X-Inertia', 'true')
            ->put(route('users.update', $user), $this->validUserPayload())
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', route('users.index'))
            ->assertSessionHasNoErrors();
    }

    public function test_non_admin_with_modify_permission_cannot_open_their_own_edit_form(): void
    {
        $user = $this->createUser('secretaria@example.com', '10000002');
        $user->givePermissionTo('modificar_usuario');

        $this->assertFalse($user->can('update', $user));

        $this->actingAs($user)
            ->get(route('users.edit', $user))
            ->assertForbidden();
    }

    public function test_secretaria_cannot_access_any_user_management_route_even_with_legacy_permissions(): void
    {
        $secretaria = $this->createUser('secretaria@example.com', '10000002');
        $target = $this->createUser('usuario@example.com', '10000003');
        $secretaria->assignRole('Admin_global');
        $secretaria->givePermissionTo([
            'crear_usuario',
            'consultar_usuario',
            'modificar_usuario',
            'restore_usuario',
        ]);

        $routes = [
            ['GET', route('users.index'), []],
            ['POST', route('users.store'), $this->validUserPayload()],
            ['GET', route('users.create'), []],
            ['GET', route('users.show', $target), []],
            ['PUT', route('users.update', $target), $this->validUserPayload()],
            ['DELETE', route('users.destroy', $target), []],
            ['GET', route('coordinadores.carreras.edit', $target), []],
            ['PATCH', route('coordinadores.carreras.update', $target), ['carreras_ids' => []]],
            ['GET', route('users.edit', $target), []],
            ['PATCH', route('users.password.update', $target), [
                'password' => 'Nueva-clave-123',
                'password_confirmation' => 'Nueva-clave-123',
            ]],
            ['PATCH', route('users.toggleStatus', $target), []],
        ];

        $this->actingAs($secretaria);

        foreach ($routes as [$method, $uri, $parameters]) {
            $response = $this->call($method, $uri, $parameters);

            $this->assertSame(403, $response->getStatusCode(), "{$method} {$uri} no fue bloqueada.");
        }
    }

    public function test_admin_can_access_the_user_index(): void
    {
        $this->actingAs($this->createAdministrator())
            ->get(route('users.index'))
            ->assertOk();
    }

    public function test_admin_can_create_a_user_with_an_uppercase_email_and_it_is_stored_lowercase(): void
    {
        $this->actingAs($this->createAdministrator())
            ->post(route('users.store'), $this->validUserPayload([
                'name' => 'nuevo-usuario',
                'email' => 'NUEVO.USUARIO@EXAMPLE.COM',
                'dni' => '10000003',
                'password' => 'Clave-segura-123',
                'password_confirmation' => 'Clave-segura-123',
            ]))
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', [
            'name' => 'nuevo-usuario',
            'email' => 'nuevo.usuario@example.com',
        ]);
    }

    public function test_user_email_uniqueness_is_case_insensitive_after_normalization(): void
    {
        $this->createUser('usuario@example.com', '10000002');

        $this->actingAs($this->createAdministrator())
            ->from(route('users.create'))
            ->post(route('users.store'), $this->validUserPayload([
                'name' => 'usuario-duplicado',
                'email' => 'USUARIO@EXAMPLE.COM',
                'dni' => '10000003',
                'password' => 'Clave-segura-123',
                'password_confirmation' => 'Clave-segura-123',
            ]))
            ->assertSessionHasErrors([
                'email' => 'El valor del campo correo electrónico ya está en uso.',
            ]);

        $this->assertSame(1, User::where('email', 'usuario@example.com')->count());
    }

    public function test_user_form_validation_messages_are_returned_in_spanish(): void
    {
        $this->actingAs($this->createAdministrator())
            ->from(route('users.create'))
            ->post(route('users.store'), $this->validUserPayload([
                'email' => 'correo-invalido',
                'dni' => '10000003',
                'password' => 'Clave-segura-123',
                'password_confirmation' => 'otra-clave',
            ]))
            ->assertSessionHasErrors([
                'email' => 'El campo correo electrónico debe ser una dirección de correo electrónico válida.',
                'password' => 'La confirmación del campo contraseña no coincide.',
            ]);
    }

    public function test_admin_user_update_normalizes_an_uppercase_email(): void
    {
        $admin = $this->createAdministrator();
        $user = $this->createUser('usuario@example.com', '10000002');

        $this->actingAs($admin)
            ->put(route('users.update', $user), $this->validUserPayload([
                'email' => 'USUARIO.ACTUALIZADO@EXAMPLE.COM',
            ]))
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('users.index'));

        $this->assertSame('usuario.actualizado@example.com', $user->refresh()->email);
    }

    public function test_public_registration_routes_are_disabled(): void
    {
        $this->assertFalse(Route::has('register'));
        $this->get('/register')->assertNotFound();
        $this->post('/register')->assertNotFound();
    }

    public function test_non_admin_cannot_update_their_profile_through_the_direct_route(): void
    {
        $user = $this->createUser('secretaria@example.com', '10000002');
        $user->givePermissionTo('modificar_usuario');

        $this->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => 'nombre-cambiado',
                'email' => 'nuevo@example.com',
            ])
            ->assertForbidden();

        $user->refresh();

        $this->assertSame('secretaria', $user->name);
        $this->assertSame('secretaria@example.com', $user->email);
    }

    public function test_non_admin_cannot_update_their_password_through_the_profile_route(): void
    {
        $user = $this->createUser('secretaria@example.com', '10000002');
        $originalPassword = $user->password;

        $this->actingAs($user)
            ->put(route('password.update'), [
                'current_password' => 'Clave-original-123',
                'password' => 'Nueva-clave-123',
                'password_confirmation' => 'Nueva-clave-123',
            ])
            ->assertForbidden();

        $this->assertSame($originalPassword, $user->refresh()->password);
    }

    public function test_admin_can_open_and_update_their_own_profile(): void
    {
        $admin = $this->createAdministrator();

        $this->assertTrue($admin->can('update', $admin));

        $this->actingAs($admin)
            ->get(route('profile.edit'))
            ->assertOk();

        $this->actingAs($admin)
            ->patch(route('profile.update'), [
                'name' => 'admin-actualizado',
                'email' => 'ADMIN-ACTUALIZADO@EXAMPLE.COM',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $admin->refresh();

        $this->assertSame('admin-actualizado', $admin->name);
        $this->assertSame('admin-actualizado@example.com', $admin->email);
    }

    public function test_admin_can_update_their_password_through_the_profile_route(): void
    {
        $admin = $this->createAdministrator();

        $this->actingAs($admin)
            ->from(route('profile.edit'))
            ->put(route('password.update'), [
                'current_password' => 'Clave-original-123',
                'password' => 'Nueva-clave-123',
                'password_confirmation' => 'Nueva-clave-123',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $this->assertTrue(Hash::check('Nueva-clave-123', $admin->refresh()->password));
    }

    public function test_password_update_requires_a_confirmed_password(): void
    {
        $admin = $this->createAdministrator();
        $user = $this->createUser('usuario@example.com', '10000002');
        $originalPassword = $user->password;

        $this->actingAs($admin)
            ->from(route('users.edit', $user))
            ->patch("/users/{$user->id}/password", [
                'password' => '',
                'password_confirmation' => '',
            ])
            ->assertSessionHasErrors('password');

        $this->assertSame($originalPassword, $user->refresh()->password);
    }

    public function test_new_password_is_hashed_by_the_password_endpoint(): void
    {
        $admin = $this->createAdministrator();
        $user = $this->createUser('usuario@example.com', '10000002');

        $response = $this->actingAs($admin)
            ->from(route('users.edit', $user))
            ->patch("/users/{$user->id}/password", [
                'password' => 'Nueva-clave-123',
                'password_confirmation' => 'Nueva-clave-123',
            ])
            ->assertSessionHasNoErrors();

        $response
            ->assertRedirect(route('users.edit', $user))
            ->assertSessionHas('success', 'Contraseña actualizada correctamente.');

        $this->assertTrue(Hash::check('Nueva-clave-123', $user->refresh()->password));
        $this->assertArrayNotHasKey('password', $user->toArray());
    }

    private function createUser(string $email, string $dni): User
    {
        return User::create([
            'name' => str($email)->before('@')->value(),
            'email' => $email,
            'password' => 'Clave-original-123',
            'dni' => $dni,
            'nombre' => 'Nombre',
            'apellido' => 'Apellido',
            'is_activo' => true,
            'cargo' => 'Administrador',
            'instituto_id' => null,
        ]);
    }

    private function createAdministrator(): User
    {
        $admin = $this->createUser('admin@example.com', '10000001');
        $admin->assignRole('Admin');
        $admin->givePermissionTo('modificar_usuario');

        return $admin;
    }

    private function validUserPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'usuario',
            'email' => 'usuario@example.com',
            'dni' => '10000002',
            'nombre' => 'Nombre actualizado',
            'apellido' => 'Apellido actualizado',
            'cargo' => 'Administrador',
            'instituto_id' => null,
        ], $overrides);
    }
}

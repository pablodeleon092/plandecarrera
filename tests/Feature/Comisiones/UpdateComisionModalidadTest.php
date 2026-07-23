<?php

namespace Tests\Feature\Comisiones;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Comision;
use App\Models\Materia;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class UpdateComisionModalidadTest extends TestCase
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
            $table->unsignedBigInteger('id_materia');
            $table->boolean('estado')->default(true);
            $table->timestamps();
        });

        Schema::create('horarios', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comision_id');
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

        Gate::before(fn () => true);
        $this->withoutMiddleware(HandleInertiaRequests::class);
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('role_has_permissions');
        Schema::dropIfExists('model_has_permissions');
        Schema::dropIfExists('model_has_roles');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('horarios');
        Schema::dropIfExists('comisiones');
        Schema::dropIfExists('materias');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    #[DataProvider('modalidadesValidas')]
    public function test_update_accepts_the_three_database_modalities(string $modalidad): void
    {
        [$user, $materia, $comision] = $this->fixture();

        $this->actingAs($user)
            ->put(route('comisiones.update', $comision), $this->payload($materia, $modalidad))
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('comisiones.index'));

        $this->assertDatabaseHas('comisiones', [
            'id' => $comision->id,
            'modalidad' => $modalidad,
        ]);
    }

    #[DataProvider('modalidadesValidas')]
    public function test_store_accepts_the_three_database_modalities(string $modalidad): void
    {
        [$user, $materia] = $this->fixture();
        $payload = $this->payload($materia, $modalidad);
        $payload['codigo'] = 'ALG101-B';
        $payload['nombre'] = 'Álgebra I - B';

        $this->actingAs($user)
            ->post(route('comisiones.store'), $payload)
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('materias.show', $materia));

        $this->assertDatabaseHas('comisiones', [
            'codigo' => 'ALG101-B',
            'modalidad' => $modalidad,
        ]);
    }

    public function test_invalid_modality_is_returned_as_a_field_error(): void
    {
        [$user, $materia, $comision] = $this->fixture();

        $this->actingAs($user)
            ->from(route('comisiones.edit', $comision))
            ->put(route('comisiones.update', $comision), $this->payload($materia, 'Presencial'))
            ->assertRedirect(route('comisiones.edit', $comision))
            ->assertSessionHasErrors([
                'modalidad' => 'La modalidad seleccionada no es válida',
            ])
            ->assertSessionMissing('error');
    }

    public static function modalidadesValidas(): array
    {
        return [
            'presencial' => ['presencial'],
            'virtual' => ['virtual'],
            'mixta' => ['mixta'],
        ];
    }

    private function fixture(): array
    {
        $user = User::create([
            'name' => 'secretaria',
            'email' => 'secretaria@example.com',
            'password' => 'Clave-segura-123',
            'dni' => '30000002',
            'nombre' => 'Secretaría',
            'apellido' => 'Académica',
            'is_activo' => true,
            'cargo' => 'Administrativo de Secretaría Académica',
        ]);

        $materia = Materia::create([
            'nombre' => 'Álgebra I',
            'codigo' => 'ALG101',
            'estado' => true,
            'regimen' => 'cuatrimestral',
            'cuatrimestre' => 1,
            'horas_semanales' => 8,
            'horas_totales' => 128,
        ]);

        $comision = Comision::create([
            'codigo' => 'ALG101-A',
            'nombre' => 'Álgebra I - A',
            'turno' => 'Tarde',
            'modalidad' => 'presencial',
            'sede' => 'Ushuaia',
            'anio' => 2026,
            'cuatrimestre' => '1ro',
            'horas_teoricas' => 4,
            'horas_practicas' => 4,
            'horas_totales' => 8,
            'id_materia' => $materia->id,
        ]);

        return [$user, $materia, $comision];
    }

    private function payload(Materia $materia, string $modalidad): array
    {
        return [
            'codigo' => 'ALG101-A',
            'nombre' => 'Álgebra I - A',
            'turno' => 'Tarde',
            'modalidad' => $modalidad,
            'sede' => 'Ushuaia',
            'anio' => 2026,
            'cuatrimestre' => '1ro',
            'horas_teoricas' => 4,
            'horas_practicas' => 4,
            'horas_totales' => 8,
            'id_materia' => $materia->id,
        ];
    }
}

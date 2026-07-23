<?php

namespace Tests\Unit\Policies;

use App\Models\Carrera;
use App\Models\Comision;
use App\Models\Docente;
use App\Models\Horario;
use App\Models\Materia;
use App\Models\User;
use App\Policies\CarreraPolicy;
use App\Policies\ComisionPolicy;
use App\Policies\DocentePolicy;
use App\Policies\HorarioPolicy;
use App\Policies\MateriaPolicy;
use App\Policies\UserPolicy;
use Mockery;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DeleteAuthorizationTest extends TestCase
{
    #[DataProvider('deleteAuthorizationMatrix')]
    public function test_delete_authorization_matrix(
        string $roleName,
        string $policyClass,
        string $modelClass,
        bool $expected,
    ): void {
        $user = Mockery::mock(User::class)->makePartial();
        $user->shouldReceive('can')->andReturn($roleName !== 'Admin');
        $user->setRelation('roles', collect([
            new Role(['name' => $roleName, 'guard_name' => 'web']),
        ]));

        $this->assertTrue(class_exists($policyClass), "{$policyClass} must exist.");

        $policy = new $policyClass;
        $target = new $modelClass;

        if ($target instanceof Comision) {
            $target->setRelation('materia', new Materia);
        }

        $this->assertSame(
            $expected,
            $policy->delete($user, $target),
            sprintf('%s should %s delete %s.', $roleName, $expected ? 'be allowed to' : 'not be allowed to', $modelClass),
        );
    }

    /**
     * @return iterable<string, array{string, class-string, class-string, bool}>
     */
    public static function deleteAuthorizationMatrix(): iterable
    {
        $adminOnlyPolicies = [
            [UserPolicy::class, User::class],
            [CarreraPolicy::class, Carrera::class],
            [MateriaPolicy::class, Materia::class],
            [DocentePolicy::class, Docente::class],
            [ComisionPolicy::class, Comision::class],
        ];

        foreach ($adminOnlyPolicies as [$policyClass, $modelClass]) {
            $modelName = class_basename($modelClass);

            yield "Admin may delete {$modelName}" => ['Admin', $policyClass, $modelClass, true];

            foreach (['Admin_global', 'Admin_instituto', 'Coord_carrera', 'Consulta_instituto'] as $roleName) {
                yield "{$roleName} may not delete {$modelName}" => [$roleName, $policyClass, $modelClass, false];
            }
        }

        yield 'Admin may delete Horario' => ['Admin', HorarioPolicy::class, Horario::class, true];
        yield 'Admin_global may delete Horario' => ['Admin_global', HorarioPolicy::class, Horario::class, true];
        yield 'Admin_instituto may not delete Horario' => ['Admin_instituto', HorarioPolicy::class, Horario::class, false];
    }
}

<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PasswordUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_update_their_password_from_the_profile(): void
    {
        $user = User::factory()->create();
        $originalPassword = $user->password;

        $this
            ->actingAs($user)
            ->from('/profile')
            ->put('/password', [
                'current_password' => 'password',
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ])
            ->assertForbidden();

        $this->assertSame($originalPassword, $user->refresh()->password);
    }

    public function test_admin_password_can_be_updated(): void
    {
        $user = $this->createAdmin();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->put('/password', [
                'current_password' => 'password',
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertTrue(Hash::check('new-password', $user->refresh()->password));
    }

    public function test_correct_password_must_be_provided_to_update_password(): void
    {
        $user = $this->createAdmin();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->put('/password', [
                'current_password' => 'wrong-password',
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ]);

        $response
            ->assertSessionHasErrors('current_password')
            ->assertRedirect('/profile');
    }

    private function createAdmin(): User
    {
        $admin = User::factory()->create();
        $role = Role::create([
            'name' => 'Admin',
            'guard_name' => 'web',
        ]);
        $admin->assignRole($role);

        return $admin;
    }
}

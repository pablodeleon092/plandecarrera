<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_details_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('profile.show'));

        $response->assertOk();
    }

    public function test_non_admin_cannot_open_their_profile_edit_page(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->get(route('profile.edit'))
            ->assertForbidden();
    }

    public function test_admin_can_update_their_profile_information(): void
    {
        $user = $this->createAdmin();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = $this->createAdmin();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_non_admin_user_cannot_delete_their_account(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ])
            ->assertForbidden();

        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->fresh());
    }

    public function test_admin_user_can_delete_their_account(): void
    {
        $admin = $this->createAdmin();

        $this
            ->actingAs($admin)
            ->delete('/profile', [
                'password' => 'password',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($admin->fresh());
    }

    public function test_correct_password_must_be_provided_for_admin_to_delete_account(): void
    {
        $admin = $this->createAdmin();

        $response = $this
            ->actingAs($admin)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($admin->fresh());
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

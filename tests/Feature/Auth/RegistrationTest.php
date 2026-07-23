<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

class RegistrationTest extends TestCase
{
    public function test_public_registration_screen_is_not_available(): void
    {
        $this->get('/register')->assertNotFound();
    }

    public function test_public_registration_requests_are_rejected(): void
    {
        $this->post('/register')->assertNotFound();
        $this->assertGuest();
    }
}

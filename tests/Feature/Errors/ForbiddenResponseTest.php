<?php

namespace Tests\Feature\Errors;

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ForbiddenResponseTest extends TestCase
{
    private const MESSAGE = 'No tienes permisos suficientes para acceder a esta página.';

    protected function setUp(): void
    {
        parent::setUp();

        Route::middleware('web')->get('/_test/forbidden', function () {
            abort(403);
        });
    }

    public function test_inertia_requests_render_the_global_forbidden_page(): void
    {
        $response = $this->get('/_test/forbidden', [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => app(HandleInertiaRequests::class)->version(request()) ?? '',
            'X-Requested-With' => 'XMLHttpRequest',
            'Accept' => 'text/html, application/xhtml+xml',
        ]);

        $response->assertForbidden()
            ->assertHeader('X-Inertia', 'true')
            ->assertJsonPath('component', 'Errors/Forbidden')
            ->assertJsonPath('props.message', self::MESSAGE);
    }

    public function test_direct_requests_render_the_global_forbidden_page(): void
    {
        $this->get('/_test/forbidden')
            ->assertForbidden()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Errors/Forbidden')
                ->where('message', self::MESSAGE));
    }

    public function test_json_requests_receive_the_same_forbidden_message(): void
    {
        $this->getJson('/_test/forbidden')
            ->assertForbidden()
            ->assertJson([
                'message' => self::MESSAGE,
            ]);
    }
}

<?php

namespace Tests\Unit;

use Tests\TestCase;

class ComisionBackNavigationTest extends TestCase
{
    public function test_back_to_list_uses_a_native_link_to_the_commission_index(): void
    {
        $source = file_get_contents(
            resource_path('js/Pages/Comisiones/Show.jsx')
        );

        $this->assertStringContainsString(
            'href={route(\'comisiones.index\')}',
            $source
        );
        $this->assertMatchesRegularExpression(
            '/as="a"\s+href=\{route\(\'comisiones\.index\'\)\}/',
            $source
        );
        $this->assertDoesNotMatchRegularExpression(
            '/as=\{Link\}\s+href=\{route\(\'comisiones\.index\'\)\}/',
            $source
        );
    }
}

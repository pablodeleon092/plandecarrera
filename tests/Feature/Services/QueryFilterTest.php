<?php

namespace Tests\Feature\Services;

use App\Models\Carrera;
use App\Models\Instituto;
use App\Services\QueryFilter;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class QueryFilterTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('institutos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('siglas');
            $table->timestamps();
        });

        Schema::create('carreras', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->foreignId('instituto_id');
            $table->string('modalidad');
            $table->string('sede');
            $table->boolean('estado')->default(true);
            $table->timestamps();
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('carreras');
        Schema::dropIfExists('institutos');

        parent::tearDown();
    }

    public function test_contains_filter_ignores_case_and_spanish_accents(): void
    {
        $instituto = Instituto::create([
            'nombre' => 'Instituto de prueba',
            'siglas' => 'IP',
        ]);

        $carrera = Carrera::create([
            'nombre' => 'Especialización en Enseñanza de la Matemática',
            'instituto_id' => $instituto->id,
            'modalidad' => 'presencial',
            'sede' => 'Ushuaia',
        ]);

        Carrera::create([
            'nombre' => 'Contador Público',
            'instituto_id' => $instituto->id,
            'modalidad' => 'presencial',
            'sede' => 'Ushuaia',
        ]);

        $query = Carrera::query();

        (new QueryFilter)->apply($query, [[
            'field' => 'nombre',
            'operator' => 'contains',
            'value' => 'ESPECIALIZACION',
        ]]);

        $this->assertSame([$carrera->id], $query->pluck('id')->all());
    }
}

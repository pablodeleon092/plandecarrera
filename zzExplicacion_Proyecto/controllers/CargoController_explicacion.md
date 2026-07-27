# Análisis Línea por Línea: Controlador `CargoController.php`

El controlador de `Cargo` maneja operaciones simples pero críticas para iniciar el ciclo de vida laboral de un docente.

```php
31:         $docente = Docente::findOrFail($validated['docente_id']);
32: 
33:         $cargo = $docente->cargos()->create([
34:             'nombre' => $validated['cargo'],
35:             'dedicacion_id' => $validated['dedicacion_id'],
36:             'nro_materias_asig' => 0,
37:             'sum_horas_frente_aula' => 0,
38:         ]);
```
- **Líneas 31-38:** **Creación Inicial con Valores Zero.**
  - Fíjate en cómo se usa `$docente->cargos()->create(...)`. En lugar de hacer `Cargo::create()` y pasarle manualmente el `docente_id`, se utiliza la relación Eloquent. Esto inyecta automáticamente el ID del docente en el nuevo cargo.
  - Las líneas 36 y 37 inicializan explícitamente los acumuladores en `0`. Esto es una excelente práctica. Cuando un docente recibe un cargo nuevo, por definición aún no tiene clases (comisiones) asignadas, por lo que sus horas frente al aula y materias son cero. Estos números subirán cuando intervenga el `DictaController`.

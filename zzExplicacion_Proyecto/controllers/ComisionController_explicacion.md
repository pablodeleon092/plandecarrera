# Análisis Línea por Línea: Controlador `ComisionController.php`

Este controlador maneja la entidad operativa más detallada del sistema. Su complejidad radica en que debe orquestar validaciones que dependen de otra entidad (la Materia).

```php
27:         if ($user->hasAnyRole(['Admin', 'Admin_global','coord_academico'])) {
28:             // Acceso completo a todas las comisiones
29: 
30:         } elseif ($user->hasAnyRole(['Admin_instituto', 'Consulta_instituto'])) {
31:             if ($user->instituto_id) {
32:                 $query->byInstituto($user->instituto_id);
```
- **Líneas 27-32:** Al igual que en `CarreraController`, este bloque aplica **Seguridad Multi-tenant**. El controlador usa el rol de Spatie para inyectar condiciones (`where`) ocultas en la consulta SQL. Un coordinador de instituto jamás podrá acceder a comisiones de otro instituto gracias a este filtro a nivel de backend.

```php
55:         $comisiones = $query
56:             ->with(['materia', 'horarios']) // Eager loading para evitar N+1
```
- **Línea 56:** **Optimización Eager Loading múltiple.** Al listar comisiones, el frontend necesita mostrar el nombre de la materia y los horarios de cada una. Si no estuviera este `with()`, mostrar 15 comisiones generaría 1 consulta base + 15 consultas de materias + 15 consultas de horarios = 31 queries. Con `with()`, se ejecutan **solo 3 queries** en total.

```php
76:                 'horarios' => $comision->horarios->map(fn ($horario) => [
77:                         'id'          => $horario->id,
78:                         'dia_semana'  => $horario->dia_semana,
79:                         'hora_inicio' => $horario->hora_inicio,
80:                         'hora_fin'    => $horario->hora_fin,
81:                     ]),
```
- **Líneas 76-81:** Dentro del método de transformación (`through()`), también se transforman las sub-colecciones (relaciones anidadas) mapeando cada horario a una estructura segura, ocultando fechas de creación o IDs internos innecesarios.

```php
156:             $validated = $request->validate([
157:                 'codigo' => [
158:                     'required',
159:                     'string',
160:                     'max:50',
161:                     Rule::unique('comisiones', 'codigo')->ignore($comision->id),
162:                 ],
```
- **Líneas 156-162:** **Validación Unique con Ignorar ID (UPDATE).** Cuando editas un registro, si mandas el mismo código, la validación `unique` normal fallaría diciendo "Este código ya existe". `Rule::unique()->ignore($id)` le dice a Laravel: "El código debe ser único en la tabla, *excepto* si pertenece al registro que estoy editando ahora mismo".

```php
185:             $materia = \App\Models\Materia::findOrFail($validated['id_materia']);
186:             $validated['horas_totales'] = $validated['horas_teoricas'] + $validated['horas_practicas'];
187: 
188:             if ($validated['horas_totales'] != $materia->horas_semanales) {
189:                 return redirect()->back()
190:                     ->with(['error' => 'Las horas deben ser exactamente '.$materia->horas_semanales.'.'])
191:                     ->withInput();
192:             }
```
- **Líneas 185-192:** **Validación de Negocio Cruzada.** Esta es una de las partes más críticas de la aplicación. No se confía en el frontend. El backend suma las horas ingresadas, busca la materia asociada en la base de datos (línea 185), y **verifica rígidamente** que la suma de horas teóricas + prácticas coincida exactamente con las horas estipuladas por la materia matriz. Si no coincide, aborta la operación, devuelve el error a React y usa `withInput()` para que el usuario no pierda lo que ya había escrito en el formulario.

```php
262:         } catch (\Exception $e) {
263:             return redirect()->route('materias.show', $materia->id)->with('error', 'No se puede eliminar la comision.' . $e->getMessage());
264:         }
```
- **Líneas 262-264:** **Cierre Seguro (Fail-safe).** Si borrar la comisión falla (quizás porque un sistema externo o un trigger en Postgres lo impidió), el usuario es redirigido con elegancia mostrando el error técnico (útil para debugging en etapas tempranas).

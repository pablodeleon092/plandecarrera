# Análisis Línea por Línea: Controlador `PlanController.php`

La creación de planes es destructiva y transformacional. Cuando creas un plan nuevo, normalmente heredas materias del anterior, lo cual hace que este controlador tenga una lógica de inicialización muy interesante.

```php
18:     public function create(int $carrera)
19:     {
20:         $carrera = Carrera::findOrFail($carrera);
21:         $this->authorize('update', $carrera);
22:         $plan_anterior = $carrera->planActual;
```
- **Líneas 18-22:** **Inyección y Autorización.** El método recibe un entero (ID de la carrera). Lo primero que hace es asegurar su existencia (`findOrFail`). Luego verifica si el usuario tiene permiso de *editar* (`update`) esa carrera. Por último, usa el método mágico `$carrera->planActual` que explicamos en `Carrera.php` para saber cuál es el plan vigente al que vamos a reemplazar.

```php
25:         $materiasEnPlanActual = $plan_anterior->materias;
26:         $materiasEnPlanIds = $materiasEnPlanActual->pluck('id');
27:         $materiasDisponibles = Materia::whereNotIn('id', $materiasEnPlanIds)->get();
```
- **Líneas 25-27:** **Separación de Conjuntos de Datos.** 
  - La línea 25 trae las materias que el plan viejo ya tiene (para pre-cargar el formulario React con las mismas).
  - La línea 26 extrae *solo los números de ID* de esas materias en un array usando `pluck('id')`.
  - La línea 27 ejecuta una consulta `WHERE id NOT IN (...)` para obtener todas las materias de la universidad que **no** formaban parte del plan viejo, y se las envía a React para mostrarlas en la lista de "Materias Disponibles para agregar al nuevo plan".

```php
50:         try {
51:             $plan = Plan::create([
52:                 'carrera_id'    => $validated['carrera_id'],
53:                 'anio_comienzo' => $validated['anio_comienzo'],
54:                 // 'anio_fin' se mantiene null hasta que se cree un nuevo plan 
55:             ]);
56: 
57:             $plan->materias()->attach($validated['materias']);
```
- **Líneas 50-57:** **Creación y Asignación Masiva Pivot.** 
  - Primero se crea el registro padre (el nuevo Plan en sí).
  - La línea 57 usa el método **`attach()`**. Toma el array de IDs de materias que llegó del frontend (`$validated['materias']` = `[1, 5, 12, 14]`) y Laravel automáticamente ejecuta los comandos SQL `INSERT INTO plan_materia...` para vincular este nuevo plan con todas esas materias en un solo paso.

```php
90:     public function desactivar(Request $request, Plan $plan) {
91:         $carrera = $plan->carrera;
92:         $this->authorize('update', $carrera);
93:         $request->validate(['anio_fin' => 'required|date']);
94:         $plan->update(['anio_fin' => $request->anio_fin]);
95:         return back()->with('success', 'Plan finalizado correctamente.');
96:     }
```
- **Líneas 90-96:** **Gestión del Historial.** No se borra un plan viejo; se "desactiva". Se recibe una fecha y se le hace un update al campo `anio_fin`. Como vimos en el Modelo `Carrera.php`, esto hará que este plan deje de ser el `$carrera->planActual` automáticamente gracias a los filtros de fecha.

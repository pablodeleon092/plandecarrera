# Análisis Línea por Línea: Controlador `HorarioController.php`

Este controlador tiene un comportamiento dual muy particular: actúa parcialmente como API (JSON) y parcialmente como controlador tradicional (Redirecciones).

```php
11:     public function index($comisionId)
12:     {
13:         $horarios = Horario::where('comision_id', $comisionId)->get();
14:         return response()->json($horarios);
15:     }
```
- **Líneas 11-15:** **Respuesta API (JSON).** A diferencia de otros controladores que retornan `Inertia::render`, este método retorna un objeto JSON puro. Esto se utiliza generalmente cuando un componente React en el frontend necesita cargar o actualizar una lista dinámicamente sin recargar la página completa ni hacer una navegación de Inertia.

```php
22:         $validated = $request->validate([
23:             'dia_semana'  => 'required|in:lunes,martes,miercoles,jueves,viernes,sabado',
24:             'hora_inicio' => 'required|regex:/^\d{2}:\d{2}$/',
25:             'hora_fin'    => 'required|regex:/^\d{2}:\d{2}$/',
```
- **Líneas 22-25:** **Validaciones con Regex (Expresiones Regulares).** 
  - La línea 23 restringe que el día sea estrictamente uno de los días laborables, previniendo errores tipográficos.
  - Las líneas 24 y 25 usan la expresión regular `/^\d{2}:\d{2}$/` para asegurar que la hora llegue en formato estricto `HH:MM`. Si un usuario o un script malicioso envía `"hora_inicio": "12:00 PM"`, la validación fallará, asegurando consistencia en la base de datos PostgreSQL (que probablemente guarda estos campos como tipo `time`).

```php
36:         Horario::create([
37:             ...$validated,
38:             'comision_id' => $comision->id,
39:         ]);
```
- **Líneas 36-39:** **Spread Operator en PHP.** El operador `...$validated` desempaqueta todo el array validado (dia_semana, hora_inicio, etc.) dentro del nuevo array de creación, y adicionalmente se inyecta el `comision_id` que se sacó de la URL (ruta). Es una sintaxis limpia y moderna de PHP 8+.

# Análisis Línea por Línea: Archivo de Rutas `web.php`

Este archivo es la "puerta de entrada" a toda tu aplicación. Mapea las URLs que escribe el usuario con los Controladores de Laravel.

```php
23: Route::middleware(['auth', 'verified'])->group(function () {
24:     Route::get('/dashboard-coordinador', [DashboardController::class, 'dashboardCoordinador'])
25:         ->name('dashboard.coordinador');
...
31: });
```
- **Líneas 23-31:** **Grupos de Middleware.** 
  - `middleware('auth')` es una capa de seguridad (un guardia de seguridad) que se asegura de que absolutamente nadie pueda acceder a las rutas de este bloque si no ha iniciado sesión. Si no estás logueado, Laravel intercepta la petición y te redirige al login antes de que siquiera llegue al `DashboardController`.
  - Agrupar (`group`) rutas bajo un middleware ahorra código, evitando tener que poner `->middleware('auth')` en cada una de las 50 rutas de la aplicación.

```php
62:     Route::resource('carreras', CarreraController::class);
63:     Route::resource('materias', MateriaController::class);
64:     Route::resource('comisiones', ComisionController::class);
```
- **Líneas 62-64:** **Rutas Resource (Mágicas).** 
  - Una línea como `Route::resource('materias', MateriaController::class)` parece pequeña, pero **escribe 7 rutas completas automáticamente por debajo**. Crea las rutas para: Listar (`GET /materias`), Crear (`GET /materias/create`), Guardar (`POST /materias`), Ver (`GET /materias/{id}`), Editar (`GET /materias/{id}/edit`), Actualizar (`PUT /materias/{id}`) y Eliminar (`DELETE /materias/{id}`). Es el pilar del diseño RESTful de Laravel.

```php
66:     Route::patch('materias/{materia}/toggle-status', [MateriaController::class, 'toggleStatus'])->name('materias.toggleStatus');
```
- **Línea 66:** **Inyección de Modelos en Rutas (Route Model Binding).** 
  - Nota que la URL dice `{materia}` y no `{id}`. Cuando el frontend hace una petición `PATCH /materias/5/toggle-status`, Laravel ve el `5`, va a la base de datos mágicamente, busca la Materia con ID 5, y si la encuentra, se la entrega al controlador ya instanciada como objeto. Si el ID 5 no existe, Laravel lanza un error `404 Not Found` automáticamente sin que tú tengas que escribir un solo "If exists".

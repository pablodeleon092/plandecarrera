# Análisis Línea por Línea: Middleware `HandleInertiaRequests.php`

Si recuerdas, cuando analizamos los archivos de React, vimos que podías hacer `usePage().props.auth.user.permissions` desde cualquier lugar de la aplicación. **Este archivo PHP es la tubería mágica que envía esos datos desde Laravel a React en cada petición.**

```php
8: class HandleInertiaRequests extends Middleware
```
- **Línea 8:** Un "Middleware" es un pedazo de código que se ejecuta en el medio de cada solicitud. Cuando un usuario entra a `/materias`, antes de que el controlador de materias haga algo, este archivo se ejecuta primero.

```php
30:     public function share(Request $request): array
31:     {
32:         $user = $request->user();
```
- **Líneas 30-32:** **Función `share` (Compartir).** Todo lo que devuelva esta función estará disponible globalmente en todos los componentes de React como "Props" permanentes. Primero recupera al usuario logueado en la variable `$user`.

```php
36:             'auth' => [
37:                 'user' => $user ? [
38:                     'id' => $user->id,
39:                     'name' => $user->name,
40:                     'email' => $user->email,
41:                     'roles' => $user->getRoleNames(),        // ['admin', 'user']
42:                     'permissions' => $user->getAllPermissions()->pluck('name'), // ['consultar_usuario', ...]
43:                 ] : null,
44:             ],
```
- **Líneas 36-44:** **El Puente Spatie -> React.**
  - Si el usuario existe (`$user ?`), crea un arreglo que se serializará a JSON automáticamente por Inertia.
  - La magia está en la línea 42: Llama a `$user->getAllPermissions()`, que es una función de la librería Spatie. Luego le hace `pluck('name')`, lo que convierte una colección pesada de la base de datos en un arreglo simple de textos: `['crear_materia', 'borrar_docente']`.
  - ¡De aquí es de donde saca la información tu archivo `usePermissions.js` de React!

```php
45:             'flash' => [
46:                 'success' => fn () => $request->session()->get('success'),
47:                 'error' => fn () => $request->session()->get('error'),
48:             ],
```
- **Líneas 45-48:** **Manejo de Alertas Globales (Flash Messages).**
  - Cuando en un controlador guardas una materia y pones `return redirect()->route(...)->with('success', 'Materia guardada')`, Laravel guarda 'Materia guardada' en la Sesión PHP.
  - Aquí el Middleware extrae ese texto de la sesión y se lo manda a React bajo la variable `flash.success`. Es por eso que en la parte de arriba de tus pantallas de React siempre ves el código que dice: `if (flash.success) { renderizar cartel verde }`. Se utiliza un *Closure* (`fn () =>`) para que esta evaluación sea perezosa (lazy) y solo consuma memoria si React realmente pide esos datos.

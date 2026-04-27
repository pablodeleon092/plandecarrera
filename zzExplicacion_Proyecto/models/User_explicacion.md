# Análisis Línea por Línea: Modelo `User.php`

El modelo de Usuario es el corazón de la autenticación y la seguridad de permisos (roles).

```php
11: class User extends Authenticatable
12: {
13:     /** @use HasFactory<\Database\Factories\UserFactory> */
14:     use HasFactory, Notifiable, HasRoles;
```
- **Líneas 11-14:** **Traits y Herencia.** 
  - `Authenticatable`: El modelo no hereda de `Model` normal, sino de `Authenticatable`, lo que le inyecta todas las capacidades para poder iniciar sesión, recordar contraseñas, etc.
  - `use HasRoles`: **El alma de Spatie Permissions.** Este *Trait* le regala al modelo cientos de funciones ocultas como `$user->assignRole()`, `$user->hasRole()`, `$user->can()`. Sin esta pequeña línea 14, la seguridad del proyecto dejaría de existir.

```php
56:     public function carreras()
57:     {
58:         return $this->belongsToMany(Carrera::class, 'coordinador_carreras', 'user_id', 'carrera_id')
59:                     ->withTimestamps();
60:     }
```
- **Líneas 56-60:** **Relación Exclusiva para Coordinadores.** Muchos a muchos (`belongsToMany`). Un Coordinador de Carrera (que es un User) puede coordinar Ingeniería Civil y Electromecánica al mismo tiempo, mientras que Ingeniería Civil puede tener a 2 coordinadores distintos. Esto se guarda en la tabla pivote `coordinador_carreras`.

```php
67:     public function getInstitutosAutorizados()
68:     {
69:         // 1. Administrador (o usuario sin instituto asignado) -> Acceso a todos
70:         if (!$this->instituto_id) {
71:             return Instituto::with('carreras.planActual')->get(['id', 'nombre']);
72:         }
```
- **Líneas 67-72:** **Lógica Fuerte de Roles en el Modelo.** Este método es oro puro para el diseño multi-tenant. En vez de andar preguntando en cada parte del código "¿este usuario es admin? ¿le muestro todo? ¿le muestro un pedazo?", simplemente llamas a `$user->getInstitutosAutorizados()`. 
  - Si no tiene instituto (es un "Dios" Administrador), devuelve todos.

```php
75:         // 2. Coordinador de Carrera -> Tiene instituto PERO está limitado a ciertas carreras
76:         if ($this->carreras()->exists()) {
77:             $carreraIds = $this->carreras()->pluck('carreras.id'); // Obtenemos IDs de las carreras
...
81:             return Instituto::where('id', $this->instituto_id)
82:                 ->select(['id', 'nombre'])
83:                 ->with(['carreras' => function ($query) use ($carreraIds) {
84:                     $query->whereIn('carreras.id', $carreraIds)
85:                           ->with('planActual');
86:                 }])
87:                 ->get();
88:         }
```
- **Líneas 75-88:** **Filtrado Profundo (Nested Eager Loading Constraints).** Si el usuario es un Coordinador, no tiene acceso a todo su Instituto, sino a un par de carreras. 
  - La línea 83 abre un `with()` avanzado: en lugar de traer todas las carreras, usa un closure (`function($query)`) para decirle a Laravel "Tráeme *solo* las carreras de este instituto que estén dentro de la bolsa de carreras a la que este coordinador tiene acceso" (`whereIn`). Esto blinda la aplicación contra accesos indebidos a nivel de SQL.

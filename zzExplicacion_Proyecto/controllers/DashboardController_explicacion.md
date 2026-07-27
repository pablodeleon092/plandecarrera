# Análisis Línea por Línea: Controlador `DashboardController.php`

Este controlador tiene muy pocas líneas, pero implementa uno de los patrones de diseño más limpios de todo el proyecto: **El Patrón Estrategia (Strategy) + Factory**.

```php
18:     public function home(Request $request)
19:     {
20:         $user = Auth::user();
```
- **Líneas 18-20:** Recupera al usuario que acaba de iniciar sesión.

```php
22:         // Resolvemos la estrategia según el cargo
23:         $strategy = DashboardFactory::make($user->cargo);
24: 
25:         // Ejecutamos el renderizado de esa estrategia
26:         return $strategy->render($user, $request);
27:     }
```
- **Líneas 22-26:** **Eliminación de If/Else masivos.** 
  - En un proyecto tradicional, este archivo tendría 200 líneas de código diciendo: `if ($user->cargo == 'admin') { contar carreras; contar docentes; return view('AdminDashboard') } elseif ($user->cargo == 'coordinador') { ... }`. Eso es un anti-patrón de diseño (código espagueti).
  - En su lugar, usa un **Factory** (`DashboardFactory::make()`). Le pasamos el cargo, y el Factory nos devuelve un "Objeto Estrategia" especializado para ese rol. 
  - Luego simplemente llamamos a `$strategy->render()`. Cada estrategia sabe exactamente qué datos buscar en la base de datos y qué vista de React dibujar. Esto hace que el controlador cumpla el **Principio de Responsabilidad Única (SRP)** de SOLID.

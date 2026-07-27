# Análisis Línea por Línea: Clase `DashboardFactory.php`

Como vimos en el `DashboardController`, la aplicación evita usar la sentencia `if/else` gigantesca para decidir qué pantalla mostrarle al usuario al iniciar sesión. En su lugar, usa un **Patrón de Diseño Factory** (Fábrica).

```php
13: class DashboardFactory
14: {
15:     public static function make(?string $cargo): DashboardStrategy
16:     {
```
- **Líneas 13-16:** **Método Estático Factory.** 
  - Se crea una clase `DashboardFactory` con un método estático `make`. Al ser estático, puedes llamarlo sin instanciar la clase (sin hacer `new DashboardFactory`).
  - La firma de la función exige devolver un objeto que cumpla con la "Interfaz" `DashboardStrategy`. Esto es programación sólida (Tipado Fuerte): no puedes devolver un texto o un número, *tienes* que devolver una estrategia válida.

```php
17:         return match ($cargo) {
18:             'Consejero' => new ConsejeroDashboard(),
19:             'Secretaría académica', 'Administrativo de Secretaria Academica' => new SecretariaDashboard(),
20:             'Director de instituto' => new DirectorDashboard(),
...
24:             'Administrador' => new DefaultDashboard(),
25:             default => new DefaultDashboard(),
26:         };
```
- **Líneas 17-26:** **La expresión `match` de PHP 8.**
  - `match` es la evolución moderna del viejo `switch/case`. Es muchísimo más rápido, conciso, y no requiere escribir `break;` en cada línea.
  - La función toma el `$cargo` del usuario. Si es "Director de instituto", automáticamente construye en memoria (`new`) la clase responsable del panel del director (`DirectorDashboard()`) y se la envía de regreso al Controlador.
  - Si en el futuro la universidad crea el cargo "Rector", no tienes que tocar el Controlador para nada. Solo vienes a esta línea y agregas `'Rector' => new RectorDashboard()`. **Este es el Principio Abierto/Cerrado (Open/Closed Principle) de SOLID.**

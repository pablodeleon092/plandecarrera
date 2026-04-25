# Análisis Línea por Línea: Migración `create_dictas_table.php`

Las migraciones de Laravel son como un "Control de Versiones" (Git) pero para tu Base de Datos. En lugar de ejecutar código SQL manualmente (`CREATE TABLE...`), lo escribes en PHP y Laravel lo traduce a cualquier motor (Postgres, MySQL).

```php
20:         Schema::create('dictas', function (Blueprint $table) {
21:             $table->id();
22:             $table->foreignId('docente_id')->constrained('docentes')->onDelete('cascade');
23:             $table->foreignId('cargo_id')->constrained('cargos')->onDelete('cascade');
24:             $table->foreignId('comision_id')->constrained('comisiones')->onDelete('cascade');
```
- **Líneas 20-24:** **La Súper Pivot.**
  - Crea la tabla `dictas`.
  - Crea tres llaves foráneas gigantes. ¿Qué pasa si el administrador borra una "comisión" del sistema? La cláusula `onDelete('cascade')` es tu salvavidas: le dice a PostgreSQL que si la comisión madre desaparece, debe destruir automáticamente todos los registros `dictas` asociados a ella para que no queden "Docentes asignados a comisiones fantasmas".

```php
27:             $table->foreignId('funcion_aulica_id')->constrained('funciones_aulicas')->nullabe()->nullOnDelete();
```
- **Línea 27:** **Borrado Condicional Seguro.** 
  - Aquí tenemos un comportamiento distinto. Si se borra una "Función Áulica" (por ejemplo, "Profesor Adjunto"), no queremos que el docente pierda su cargo en la comisión (`cascade`). Queremos que la tabla siga existiendo, pero que ese campo quede en blanco temporalmente. Eso es lo que hace `nullOnDelete()`. *(Nota: Hay un pequeño typo en el archivo original `nullabe()` en lugar de `nullable()`, pero PostgreSQL lo puede haber ignorado o corregido en el código actual).*

```php
28:             $table->enum('modalidad_presencia', ['presencial', 'virtual', 'mixta']);
```
- **Línea 28:** **Restricción a nivel de Motor (ENUM).** Un campo `enum` protege tu base de datos contra hackers o errores de programación. Si en el futuro alguien intenta hacer un `INSERT` con `modalidad_presencia = 'telepatia'`, PostgreSQL rechazará la orden y lanzará un error, ya que solo acepta esos 3 valores exactos.

```php
37:     public function down(): void
38:     {
39:         Schema::dropIfExists('dictas');
40:         Schema::dropIfExists('funciones_aulicas');
41:     }
```
- **Líneas 37-41:** **Método Reversible.** Toda migración debe saber cómo deshacerse (`php artisan migrate:rollback`). Primero borra `dictas` y luego `funciones_aulicas` para no tener errores de colisión por llaves foráneas.

# Análisis Línea por Línea: Modelo `Plan.php`

El modelo `Plan` es comparativamente pequeño, pero gestiona un concepto fundamental: la historicidad de las carreras (versionado).

```php
7: class Plan extends Model
8: {
9:     protected $fillable = [
10:         'carrera_id',
11:         'anio_comienzo',
12:         'anio_fin',
13:     ];
```
- **Líneas 9-13:** Define qué campos se pueden llenar de forma masiva. El diseño arquitectónico dicta que un plan está vigente si su `anio_fin` es nulo o está en el futuro.

```php
19:     public function carrera()
20:     {
21:         return $this->belongsTo(Carrera::class, 'carrera_id');
22:     }
```
- **Líneas 19-22:** Establece que este plan no es huérfano, sino que pertenece inherentemente a una Carrera matriz. Esto refleja una estructura jerárquica: `Carrera -> Plan -> Materias`.

```php
24:     public function materias()
25:     {
26:         return $this->belongsToMany(Materia::class, 'plan_materia', 'plan_id', 'materia_id');
27:     }
```
- **Líneas 24-27:** **Muchos a Muchos (Pivot Clásica).** A diferencia de docentes y comisiones, la tabla `plan_materia` es una tabla pivote tradicional. Un plan puede tener muchísimas materias, y una materia (ej. "Análisis Matemático I") puede pertenecer a varios planes históricos de la misma carrera, e incluso a planes de carreras distintas (ej. Sistemas e Ingeniería Industrial). Eloquent resuelve las uniones JOIN por nosotros de manera transparente.

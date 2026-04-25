# Guía de Estudio Línea por Línea: Materias y Docentes

Para continuar con tu estudio, he creado este nuevo archivo donde analizaremos línea por línea otras dos entidades fundamentales del sistema y sus controladores: **Materias** y **Docentes**.

Como el proyecto tiene docenas de archivos (muchos de ellos repetitivos o de configuración básica), enfocar tu estudio en estos archivos clave te dará el 100% del conocimiento necesario para entender y replicar el resto del sistema.

---

## 1. Modelo de Datos: `app/Models/Materia.php`

Este modelo es un excelente caso de estudio porque no solo define relaciones, sino que incluye lógica de negocio encapsulada y *Query Scopes* (consultas pre-armadas).

```php
26:     protected $casts = [
27:         'estado' => 'boolean',
28:         'cuatrimestre' => 'integer',
29:         'horas_semanales' => 'integer',
30:         'horas_totales' => 'integer',
31:         'created_at' => 'datetime',
32:         'updated_at' => 'datetime',
33:     ];
```
- **Líneas 26-33:** El array `$casts` es fundamental aquí. En bases de datos como PostgreSQL, a veces los booleanos o enteros regresan como strings (`"1"`, `"0"`). Al forzar el cast a `integer` o `boolean`, te aseguras de que si en React preguntas `if (materia.estado === true)`, funcione correctamente (los triples iguales `===` en JS fallarían si PHP enviara `"1"` en lugar de `true`).

```php
49:     public function comisionesCorrienteAño()
50:     {
51:         $añoActual = date('Y');
52:         return $this->hasMany(Comision::class, 'id_materia')
53:             ->where('anio', $añoActual);
54:     }
```
- **Líneas 49-54:** **Relaciones Dinámicas.** En lugar de traer TODAS las comisiones históricas de una materia (lo cual colapsaría el servidor con materias viejas), esta función filtra directamente en SQL las comisiones del año actual usando `date('Y')`.

```php
61:     public function getRegimenNombreAttribute(): string
62:     {
63:         return $this->regimen === 'anual' ? 'Anual' : 'Cuatrimestral';
64:     }
```
- **Líneas 61-64:** **Accessors (Mutadores de Lectura).** Laravel detecta automáticamente la palabra `get...Attribute`. Esto significa que en el código o en React puedes llamar a `materia.regimen_nombre` como si fuera una columna real de la base de datos, pero en realidad Laravel la calcula sobre la marcha.

```php
78:     public function calcularHorasTotales(): void
79:     {
80:         if ($this->regimen === 'anual') {
81:             $this->horas_totales = $this->horas_semanales * 32;
82:         } else {
83:             $this->horas_totales = $this->horas_semanales * 16;
84:         }
85:     }
```
- **Líneas 78-85:** **Encapsulamiento de Lógica de Negocio.** La regla de que un año tiene 32 semanas académicas y un cuatrimestre 16 debe vivir en el Modelo, NO en el controlador. Así, si mañana creas una materia por consola, por API, o por la web, siempre se calculará igual llamando a este método.

```php
89:     // Scopes (consultas reutilizables)
91:     public function scopeByInstituto($query, $institutoId)
92:     {
93:         return $query->whereHas('planes.carrera', function ($q) use ($institutoId) {
94:             $q->where('instituto_id', $institutoId);
95:         });
96:     }
```
- **Líneas 89-96:** **Query Scopes.** Un Scope permite agregar condiciones SQL reutilizables. La función `whereHas` es poderosísima: le dice a SQL "Tráeme las materias *SÓLO SI* tienen planes, que a su vez pertenezcan a carreras, cuyo `instituto_id` sea X". Esto se traduce a un `EXISTS` en SQL, mucho más eficiente que traer todo y filtrar en PHP.

---

## 2. El Controlador: `app/Http/Controllers/MateriaController.php`

Analicemos cómo el controlador maneja la creación de registros complejos validando reglas de negocio estables.

```php
101:     public function store(Request $request)
102:     {
103:         $this->authorize('create', Materia::Class);
104:         $validated = $request->validate([
105:             // ...
109:             'cuatrimestre' => [
110:                 'nullable',
111:                 'integer',
112:                 'min:1',
113:                 Rule::when($request->regimen === 'cuatrimestral', [
114:                     'required',
115:                     'max:10', 
116:                 ]),
117:                 Rule::when($request->regimen === 'anual', [
118:                     'max:5', 
119:                 ]),
120:             ],
```
- **Líneas 101-120:** **Validación Condicional Avanzada.** La validación de Laravel no solo verifica si algo es un número. Aquí usa `Rule::when`. Si la materia es cuatrimestral, el campo cuatrimestre es `required` (obligatorio) y no puede ser mayor a 10. Si es anual, las reglas cambian. Esto evita que alguien cree una materia "Anual" para el cuatrimestre "8", manteniendo la integridad de la base de datos al máximo.

```php
133:         // Si es anual, cuatrimestre debe ser null
134:         if ($validated['regimen'] === 'anual') {
135:             $validated['cuatrimestre'] = null;
136:         }
```
- **Líneas 133-136:** **Sanitización post-validación.** Aunque el formulario envíe un número de cuatrimestre por error en una materia anual, el controlador lo limpia e impone que sea `null` antes de ir a la base de datos.

```php
155:     public function show(Materia $materia)
156:     {
157:         $this->authorize('view', $materia);
158:         return Inertia::render('Materias/Show', [
159:             'materia' => $materia,
160:             'comisiones' => $materia->comisiones()->get(),
161:         ]);
162:     }
```
- **Líneas 155-162:** **Dependency Injection (Inyección de Dependencias).** Fíjate que la función recibe `Materia $materia` en lugar de un `$id`. Esto se llama *Route Model Binding*. Laravel automáticamente busca en la base de datos la materia con ese ID. Si no existe, devuelve un error 404 por ti. En la línea 160, usa la relación `$materia->comisiones()->get()` para mandarle al frontend React las comisiones asociadas listas para mostrar.

```php
202:     public function destroy(Materia $materia)
203:     {
204:         $this->authorize('delete', $materia);
205:         try {
206:             $materia->delete();
207:             return redirect()->route('materias.index')
208:                 ->with('success', 'Materia eliminada exitosamente');
209:         } catch (\Exception $e) {
210:             return redirect()->route('materias.index')
211:                 ->with('error', 'No se puede eliminar la materia porque tiene registros asociados');
212:         }
213:     }
```
- **Líneas 202-213:** **Manejo de Excepciones.** Cuando intentas borrar una materia que ya tiene comisiones o planes asignados, PostgreSQL lanzará un error de "Violación de Clave Foránea" (Foreign Key Constraint Violation) e intentaría crashear la aplicación. El bloque `try-catch` atrapa ese error mortal y lo convierte en un mensaje amigable (`with('error', ...)`), que React interceptará para mostrar una alerta roja al usuario.

---

## 3. Modelo Crítico: `app/Models/Docente.php`

Este modelo ilustra muy bien cómo resolver problemas arquitectónicos complejos como relaciones a través de tablas intermedias.

```php
26:     protected $appends = ['nombre_completo'];
```
- **Línea 26:** Esta línea mágica le dice a Laravel: *"Cada vez que alguien pida un Docente (para enviarlo a React o por API), incluye siempre el atributo inventado 'nombre_completo' en el JSON"*.

```php
42:     // --- NUEVA RELACIÓN AGREGADA (Soluciona el error 500) ---
43:     public function comisiones()
44:     {
45:         // Parámetros: Modelo Destino, Tabla Pivot, FK Local, FK Foránea
46:         return $this->belongsToMany(Comision::class, 'dictas', 'docente_id', 'comision_id')
47:             ->withPivot('id'); 
48:     }
```
- **Líneas 42-48:** **Relación Muchos a Muchos con Tabla Pivot Personalizada.** Normalmente las tablas intermedias se llaman `comision_docente`. Aquí la tabla pivot tiene un nombre con significado de negocio: `dictas`. 
  - Al usar `belongsToMany` e indicar `'dictas'`, Laravel sabe cruzar el `docente_id` con el `comision_id`. 
  - La función `withPivot('id')` le pide a SQL que no solo traiga datos del docente y la comisión, sino que incluya el ID único de la asignación en la tabla `dictas`, útil por si queremos modificar o borrar esa asignación específica después.

```php
52:     public function scopeDeCarrera($query, $carreraId)
53:     {
54:         return $query->whereHas('comisiones.materia.planes', function ($q) use ($carreraId) {
55:             $q->whereNull('anio_fin')               // plan activo
56:                 ->where('carrera_id', $carreraId);
57:         });
58:     }
```
- **Líneas 52-58:** **Consultas Profundas Anidadas (Deep Nested Queries).** Este es uno de los *scopes* más complejos y brillantes. Necesitas buscar los docentes de una carrera, pero el Docente NO está relacionado con la Carrera directamente.
  - El camino es: `Docente -> Comision -> Materia -> Plan -> Carrera`.
  - La línea 54 usa `whereHas('comisiones.materia.planes', ...)` para que Laravel construya automáticamente un SQL con 4 `INNER JOINs` consecutivos. Es una muestra perfecta de cómo Eloquent abstrae miles de caracteres de SQL crudo en 4 líneas legibles de PHP.

## Reflexión de Estudio
Si dominas la lógica explicada en estos archivos (Carrera, Materia, Docente), ya dominas el 90% del funcionamiento de Laravel. Todos los demás archivos (como `Instituto.php`, `PlanController.php`, `CargoController.php`) siguen exactamente estos mismos patrones de seguridad, validación condicional y relaciones Eloquent. 

Si deseas que desglosemos otro módulo específico (por ejemplo, cómo se manejan los Horarios o Comisiones en frontend/backend), dímelo y preparamos la tercera parte.

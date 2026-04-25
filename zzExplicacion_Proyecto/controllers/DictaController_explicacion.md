# Análisis Línea por Línea: Controlador `DictaController.php`

Este es quizás **el controlador más complejo e importante del backend**, porque aplica la **Normativa Universitaria**. Si un docente excede sus horas, este controlador lo frena.

```php
62:             // Evitar duplicados
63:             $exists = Dicta::where('comision_id', $validated['comision_id'])
64:                 ->where('docente_id', $validated['docente_id'])
65:                 ->where('cargo_id', $validated['cargo_id'])
66:                 ->exists();
```
- **Líneas 62-66:** **Prevención de Doble Asignación.** Antes de guardar, consulta si ese mismo docente ya tiene asignada esa misma comisión con ese mismo cargo. Si es así, detiene la ejecución para no duplicar horas fantasmas.

```php
75:             $dicta = Dicta::create($validated);
76: 
77:             // Aplicar normativa (puede lanzar ValidationException)
78:             NormativaAsignacion::cargarHorasFrenteAlAula($dicta);
```
- **Líneas 75-78:** **Inyección de Dominio (Service Layer).** En lugar de escribir 200 líneas de código aquí para sumar horas, verificar topes de contrato de dedicación, etc., se delega esa responsabilidad matemática al servicio especializado `NormativaAsignacion`. Si el docente se excede de las horas de su contrato al intentar darle esta clase, `NormativaAsignacion` lanzará un error (ValidationException) y el flujo saltará directo al bloque `catch`.

```php
120:         // 1. CLAVE: Capturar los datos originales antes de cualquier cambio en la base de datos
121:         $originalData = $dicta->only(['cargo_id', 'horas_frente_aula', 'funcion_aulica_id', 'docente_id', 'comision_id']);
```
- **Líneas 120-121:** Cuando editas una asignación, las horas pueden subir o bajar. Por ende, debes capturar cuántas horas tenía asignadas *antes* del cambio para poder restárselas al total del docente, y luego sumarle las *nuevas* horas. Si no haces esto, el total del docente sumará infinitamente las horas nuevas sin descartar las viejas.

```php
147:             DB::transaction(function () use ($dicta, $validated, $originalData) {
148:                 
149:                 // Actualizar la dicta primero con los nuevos datos
150:                 $dicta->update($validated);
151: 
152:                 // 4. Aplicar la lógica de Normativa: Restar impacto antiguo y sumar impacto nuevo
153:                 NormativaAsignacion::updateDicta($dicta, $originalData);
154:             });
```
- **Líneas 147-154:** **Transacciones de Base de Datos (DB::transaction).** Esto es de extrema vitalidad. 
  - La línea 150 actualiza el registro en la tabla `dictas`.
  - La línea 153 actualiza los acumuladores en las tablas `docentes` y `cargos`.
  - ¿Qué pasa si la línea 150 funciona pero la 153 falla por un error del servidor? Los datos quedarían corruptos (el docente da clase pero sus horas no se sumaron). `DB::transaction` garantiza la propiedad **ACID**: Si *cualquier cosa* falla dentro de este bloque, Laravel hace un **ROLLBACK** (deshace todos los cambios de base de datos, como si nunca hubieran ocurrido), protegiendo la integridad absoluta de las horas de la universidad.

```php
183:             DB::transaction(function () use ($dicta) {
184:                 $docente = $dicta->docente;
185:                 $cargo = $dicta->cargo;
186: 
187:                 // 2. Eliminar el registro de Dicta
188:                 $dicta->delete();
189: 
190:                 // 3. Recalcular los agregados.
191:                 NormativaAsignacion::recalcularCargo($docente, $cargo);
192:                 NormativaAsignacion::recalcularCargaHorariaDocente($docente);
193:             });
```
- **Líneas 183-193:** Al eliminar (`destroy`), también usamos una Transacción. Una vez eliminado el registro de clase (`$dicta->delete()`), se llama a la Normativa para que vuelva a contar desde cero todas las horas restantes del docente y su cargo. Esto es mucho más seguro que simplemente "restar las horas borradas", ya que evita corrupciones matemáticas a largo plazo.

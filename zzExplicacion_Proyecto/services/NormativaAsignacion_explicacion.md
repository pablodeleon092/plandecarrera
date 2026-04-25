# Análisis Línea por Línea: Servicio `NormativaAsignacion.php`

A diferencia de los modelos y controladores, este archivo es un "Service Class" (Clase de Servicio). Se creó para sacar lógica de negocio compleja fuera de los controladores y evitar que estos crezcan desproporcionadamente (fat controllers).

```php
20:     private static function validarCompatibilidad(Dicta $dicta): void
21:     {
22:         $dicta->loadMissing(['funcionAulica', 'cargo']);
```
- **Líneas 20-22:** Define un método privado y estático. Privado porque solo debe usarse dentro de este mismo archivo, y estático porque no requiere instanciar la clase completa (`new NormativaAsignacion()`) para usarse. `loadMissing` carga las relaciones solo si no estaban cargadas antes en memoria.

```php
32:         $esCargoSuperior = Str::contains($cargo->nombre, ['Titular', 'Adjunto', 'Asociado']);
33:         $esCargoPractico = Str::contains($cargo->nombre, ['Jefe de Trabajos Practicos', 'Ayudante de Primera']);
34: 
35:         if (
36:             ($esTeorica && $esCargoSuperior) ||
37:             ($esPractica && $esCargoPractico) ||
38:             $esTeoricaPractica
39:         ) {
40:             return; // OK, compatible
41:         } else {
42:             throw ValidationException::withMessages([
43:                 'funcion_aulica' => 'La función áulica no es compatible con el cargo del docente.',
44:             ]);
45:         }
```
- **Líneas 32-45:** **Reglas del Negocio de la Universidad.** 
  - La clase `Str::contains` de Laravel evalúa si el texto contiene ciertas palabras. 
  - El gran bloque `if` dictamina que un Titular no puede dar Práctica, y un Ayudante no puede dar Teoría.
  - Si el IF falla, la línea 42 **lanza una excepción de validación**. Esta no es un simple `return false`. Es un error violento que rompe la ejecución en este punto exacto, viaja hasta el bloque `catch` del `DictaController`, y le devuelve un mensaje amigable al frontend.

```php
57:     public static function recalcularCargo($docente, $cargo): void
58:     {
59:         // 1. SUMA de horas frente al aula
60:         $totalHoras = Dicta::join('comisiones', 'dictas.comision_id', '=', 'comisiones.id')
61:             ->where('dictas.docente_id', $docente->id)
62:             ->where('dictas.cargo_id', $cargo->id)
63:             ->where('comisiones.estado', true)
64:             ->sum('dictas.horas_frente_aula');
```
- **Líneas 57-64:** **Recálculo Seguro (Single Source of Truth).** En vez de confiar en la suma mental de PHP ("antes tenía 4 horas, le sumo 2, me da 6"), este método hace una sumatoria absoluta (`sum()`) cruzando la tabla `dictas` con la tabla `comisiones`, para contar horas *solo si* la comisión sigue activa. Si se usara matemática simple (x = x + 2), en sistemas concurrentes (donde dos directores editan a la vez) se podrían perder sumas. Ir siempre a la base de datos es infalible.

```php
142:     public static function updateDicta(Dicta $dicta, array $originalData): void
143:     {
...
152:         if ($originalData['cargo_id'] !== $dicta->cargo_id) {
153:             $cargoAnterior = $docente->cargos()->find($originalData['cargo_id']);
154:             if ($cargoAnterior) {
155:                 self::recalcularCargo($docente, $cargoAnterior);
156:             }
157:         }
158: 
159:         self::recalcularCargo($docente, $dicta->cargo);
```
- **Líneas 142-159:** **Manejo de Transición de Estados.** Si un docente cambia su asignación de clase (pasa de usar su cargo "Titular" a su cargo "Adjunto"), las horas deben borrarse del cargo Titular y sumarse al cargo Adjunto. Este bloque detecta que los cargos no coinciden (línea 152), y recalcula ambos cargos (líneas 155 y 159) para dejarlos perfectos.

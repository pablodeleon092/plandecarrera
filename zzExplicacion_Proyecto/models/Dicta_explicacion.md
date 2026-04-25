# Análisis Línea por Línea: Modelo `Dicta.php`

El modelo `Dicta` es la pieza central que une casi todos los conceptos del sistema. Técnicamente es un modelo normal, pero arquitectónicamente funciona como una **"Tabla Pivot Evolucionada"** (Super Pivot).

```php
7: class Dicta extends Model
8: {
9:     protected $fillable  = [
10:         'comision_id',
11:         'docente_id',
12:         'cargo_id',
13:         'ano_inicio',
14:         'año_fin',
15:         'modalidad_presencia',
16:         'horas_frente_aula',
17:         'funcion_aulica_id',
18:     ];
```
- **Líneas 7-18:** **El Corazón de la Asignación.** Cuando un docente da clases, no se vincula solo a la comisión, se vincula **usando un cargo específico**. Por ejemplo: El Profesor Juan (Docente) enseña Programación I (Comisión) utilizando su cargo de Jefe de Trabajos Prácticos (Cargo), los lunes de forma presencial (Modalidad), por 4 horas (Horas), bajo el rol de Auxiliar Práctico (Función Áulica). Todo ese evento masivo queda registrado en este único modelo.

```php
20:     public function comision() { return $this->belongsTo(Comision::class, 'comision_id'); }
25:     public function docente() { return $this->belongsTo(Docente::class, 'docente_id'); }
30:     public function cargo() { return $this->belongsTo(Cargo::class, 'cargo_id'); }
35:     public function funcionAulica() { return $this->belongsTo(FuncionAulica::class, 'funcion_aulica_id'); }
```
- **Líneas 20-38:** **Nodo Central (Hub).** Como se puede apreciar, `Dicta` tiene 4 llaves foráneas. Al ser un modelo de Eloquent independiente (en lugar de una simple tabla intermedia definida en migraciones), nos permite cargar cualquiera de estas 4 ramas con Eager Loading (`Dicta::with('docente', 'comision')->get()`), facilitando inmensamente la lógica de listados y cálculos que veremos en su controlador.

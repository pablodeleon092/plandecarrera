# Análisis Línea por Línea: Modelo `Horario.php`

El modelo `Horario` es muy sencillo y directo. Actúa como un detalle secundario de la entidad principal `Comision`.

```php
9:     protected $fillable = [
10:         'id',
11:         'comision_id',
12:         'dia_semana',
13:         'hora_inicio',
14:         'hora_fin',
15:         'aula'
16:     ]; 
```
- **Líneas 9-16:** Los campos asignables en masa. Define los bloques de tiempo en los que una comisión de estudiantes se reunirá. Un horario siempre pertenece a una comisión, por eso incluye `comision_id`.

```php
20:     public function comision()
21:     {
22:         return $this->belongsTo(Comision::class, 'comision_id');
23:     }
```
- **Líneas 20-23:** **Relación de Pertenencia (BelongsTo).** Dado que un horario no tiene sentido por sí mismo sin una clase a la que asistir, siempre pertenecerá a una Comisión matriz. Esta relación permite hacer `$horario->comision->materia->nombre` para saber de qué materia es este horario.

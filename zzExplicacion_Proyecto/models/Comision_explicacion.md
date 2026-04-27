# Análisis Línea por Línea: Modelo `Comision.php`

El modelo `Comision` es uno de los más complejos del sistema porque agrupa horarios, docentes (con cargos) y pertenece a una materia.

```php
29:     protected $attributes = [
30:         'estado' => true, 
31:     ];
```
- **Líneas 29-31:** **Valores por defecto a nivel base de datos.** Si en alguna parte del código (o incluso en consola) alguien crea una Comisión y olvida pasarle el campo `'estado'`, Laravel automáticamente le asignará `true`. Esto es más seguro que depender de que la base de datos tenga un `DEFAULT TRUE`.

```php
33:     protected $appends = ['docentes_with_cargo', 'docentes_names_by_cargo'];
```
- **Línea 33:** **Atributos Calculados (Appends).** Cada vez que se serialice una Comisión a JSON (para enviarla a React), Laravel obligatoriamente calculará y adjuntará estos dos atributos virtuales, aunque no existan como columnas en la tabla PostgreSQL.

```php
40:     public function docentes()
41:     {
42:         return $this->belongsToMany(Docente::class, 'dictas', 'comision_id', 'docente_id')
43:                     ->withPivot('cargo_id', 'ano_inicio', 'año_fin', 'modalidad_presencia', 'horas_frente_aula', 'funcion_aulica_id')
44:                     ->withTimestamps();
45:     }
```
- **Líneas 40-45:** **Relación Pivot Enriquecida.** Una relación muchos-a-muchos estándar solo guarda `id_a` e `id_b`. Pero la tabla `dictas` guarda muchísima información extra (cargo, horas, función). El método `withPivot` instruye a Laravel para que, al traer un Docente, también traiga toda esa data intermedia, permitiendo hacer cosas como `$docente->pivot->horas_frente_aula`.

```php
57:     public function getDocentesWithCargoAttribute()
58:     {
59:         if ($this->relationLoaded('dictas')) {
60:             $dictas = $this->dictas; 
61:         } else {
62:             $dictas = $this->dictas()->with(['docente', 'cargo'])->get();
63:         }
```
- **Líneas 57-63:** **Accessors Optimizados.** Este método calcula uno de los `$appends` de arriba. 
  - La línea 59 verifica: "¿Ya cargué en memoria la relación `dictas` antes?". Si es así, la usa. Si no, fuerza la carga en la línea 62 incluyendo sub-relaciones (`with(['docente', 'cargo'])`) para evitar que más abajo ocurra el temido problema N+1 al mapear.

```php
68:         return $dictas->map(function($dicta) {
69:             $docenteNombre = $dicta->docente->nombre ?? 'N/A';
```
- **Línea 68-69:** **Programación Defensiva.** Usa el operador de fusión nula (`??`). Si por algún error de base de datos la tabla `dictas` apunta a un docente que fue borrado físicamente, `$dicta->docente` será `null`. En lugar de romper toda la aplicación con un "Trying to get property 'nombre' of non-object", simplemente devolverá `'N/A'`.

```php
164:     public function estaCompleta()
165:     {
166:         $cargos = $this->dictas->map(fn($d) => strtolower($d->cargo->nombre ?? ''));
167:         
168:         $tieneResponsable = $cargos->contains(fn($c) => 
169:             str_contains($c, 'titular') || str_contains($c, 'adjunto')
170:         );
171:         
172:         $tieneAuxiliar = $cargos->contains(fn($c) => 
173:             str_contains($c, 'jefe de trabajos') || str_contains($c, 'ayudante')
174:         );
175: 
176:         return $tieneResponsable && $tieneAuxiliar;
177:     }
```
- **Líneas 164-177:** **Lógica de Negocio Pura.** Una regla académica es que una comisión está "completa" si tiene un docente responsable (Titular/Adjunto) Y un auxiliar (JTP/Ayudante). Esta función evalúa la colección en memoria y devuelve un booleano. Se encapsula aquí para poder reutilizarla en validaciones o en la interfaz (para pintar la comisión de rojo si está incompleta).

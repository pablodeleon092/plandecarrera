# Análisis Línea por Línea: Modelo `Cargo.php`

El modelo `Cargo` representa la posición formal que un docente tiene en la universidad. A diferencia de las horas de cursada, el cargo está ligado a un contrato y dedicación (ej. Simple, Exclusiva).

```php
13:     protected $fillable = [
14:         'nombre',
15:         'docente_id',
16:         'dedicacion_id',
17:         'nro_materias_asig',
18:         'sum_horas_frente_aula',
19:     ];
```
- **Líneas 13-19:** **Campos Acumuladores.** Aparte de sus datos básicos, el cargo tiene columnas como `nro_materias_asig` y `sum_horas_frente_aula`. Estos funcionan como cachés o "contadores". Cada vez que un docente asume una clase (en `Dicta`), estos campos deberían actualizarse. Esto evita tener que correr consultas SQL masivas de suma (`SUM()`) en la base de datos constantemente.

```php
21:     public function docente()
22:     {
23:         return $this->belongsTo(Docente::class);
24:     }
25: 
26:     public function dedicacion()
27:     {
28:         return $this->belongsTo(Dedicacion::class);
29:     }
```
- **Líneas 21-29:** **Múltiples relaciones inversas.** El Cargo sirve como puente de negocio: relaciona a un `Docente` (la persona) con una `Dedicacion` (las reglas contractuales, horas semanales a cumplir).

```php
31:     /*Utiliza las relaciones dicta del docente para calcular las horas frente a aula, */
32:     public function calcularHorasFrenteAula()
```
- **Línea 31:** Métodos definidos que, según los comentarios, centralizarán la lógica para recalcular los acumuladores que mencionamos en la línea 18.

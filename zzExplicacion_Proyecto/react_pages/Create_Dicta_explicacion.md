# Análisis Línea por Línea: Componente `Create.jsx` (Dictas)

Este archivo maneja la vista donde finalmente conectamos a un Docente con una Comisión (lo que en el modelo llamamos la súper pivot `Dicta`).

```javascript
6: export default function CreateDicta({ auth, comision, flash, docente, funcionesAulicas }) {
7:     const { data, setData, post, errors } = useForm({
8:         comision_id: comision.id,
9:         docente_id: docente.id,
10:         cargo_id: '',
...
16:     });
```
- **Líneas 6-16:** **Inicialización Mapeada.** Fíjate que el controlador de Laravel envía a este componente tanto a la `comision` como al `docente` que se seleccionó en las pantallas anteriores. El Hook `useForm` ya pre-carga automáticamente `comision.id` y `docente.id`. ¡Así el usuario no tiene que seleccionarlos de nuevo en el formulario!

```javascript
60:                                 {docente.cargos.map(cargo => (
61:                                     <option key={cargo.id} value={cargo.id}>{cargo.nombre}</option>
62:                                 ))}
```
- **Líneas 60-62:** **Iteración de Relaciones Anidadas.** El campo `<select>` de Cargos no muestra todos los cargos de la universidad, sino solo los cargos *de ese docente específico*. Esto se logra porque Laravel envió la relación cargada (`docente->cargos`), y React usa `.map()` para transformar ese array de base de datos en etiquetas HTML `<option>`. La propiedad `key={cargo.id}` es obligatoria en React para que el motor virtual no se confunda al renderizar listas dinámicas.

```javascript
142:                                 onClick={(e) => {
143:                                     e.preventDefault();
144:                                     window.history.back();
145:                                 }}
```
- **Líneas 142-145:** **Navegación en el Navegador.** El botón "Cancelar" usa la API nativa de JavaScript (`window.history.back()`). En lugar de redirigirte a una ruta estática (ej. `/comisiones`), simplemente simula que el usuario presionó el botón de "Atrás" en su navegador Chrome. Es súper útil para formularios modulares donde el usuario pudo haber llegado desde 3 lugares distintos.

# Análisis Línea por Línea: Componente `Create.jsx` (Materias)

Este archivo es un ejemplo perfecto de cómo funciona Inertia.js combinando React con el backend de Laravel sin necesitar llamadas `fetch` o `axios` explícitas.

```javascript
7:     const { data, setData, post, processing, errors } = useForm({
8:         nombre: '',
9:         codigo: '',
10:         // ... otros campos
15:     });
```
- **Líneas 7-15:** **El Hook `useForm` de Inertia.** A diferencia de los formularios en React puro donde tienes que crear un `useState` para cada input, Inertia provee `useForm`. 
  - `data` es el estado actual de los inputs.
  - `setData` es la función para actualizarlos.
  - `post` envía los datos a Laravel automáticamente.
  - `processing` es un booleano que es `true` mientras el formulario está cargando.
  - `errors` atrapa cualquier error de validación (¡los que Laravel lanzó en el controlador con `$request->validate()` llegan automáticamente aquí!).

```javascript
17:     // Calcular horas totales automáticamente
18:     useEffect(() => {
19:         if (data.horas_semanales && data.regimen) {
20:             const semanas = data.regimen === 'anual' ? 32 : 16;
21:             setData('horas_totales', parseInt(data.horas_semanales) * semanas);
22:         }
23:     }, [data.horas_semanales, data.regimen]);
```
- **Líneas 17-23:** **El Hook `useEffect` (Efectos Secundarios).** Esta función vigila las variables dentro del array `[data.horas_semanales, data.regimen]`. Si el usuario escribe "4" en horas semanales, este efecto se dispara instantáneamente y multiplica 4 por 16 semanas (si es cuatrimestral), auto-rellenando el campo "Horas Totales" en tiempo real sin requerir cálculos en el servidor.

```javascript
25:     const handleSubmit = (e) => {
26:         e.preventDefault();
27:         post('/materias');
28:     };
```
- **Líneas 25-28:** Envío del formulario. El `e.preventDefault()` evita que el navegador recargue la página. Al ejecutar `post('/materias')`, Inertia envía todos los `data` hacia la ruta POST de materias en Laravel.

```javascript
71:                                         value={data.nombre}
72:                                         onChange={e => setData('nombre', e.target.value)}
...
76:                                     {errors.nombre && (
77:                                         <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
78:                                     )}
```
- **Líneas 71-78:** **Binding Bidireccional y Manejo de Errores.** Cada vez que el usuario teclea (`onChange`), se actualiza el estado. Si hubo un error en Laravel (ej. "El nombre es obligatorio"), se muestra en rojo justo debajo del input mágicamente a través del objeto `errors.nombre`.

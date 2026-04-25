# Análisis Línea por Línea: Componente `GestionMaterias.jsx` (Filtros)

Este archivo orquesta cómo los filtros dinámicos (búsquedas avanzadas) se comunican con Laravel sin recargar la página.

```javascript
8:     // Definimos qué campos pueden ser filtrados
9:     const availableFields = [
10:         { key: 'nombre', label: 'Nombre', type: 'string' },
11:         { key: 'estado', label: 'Estado', type: 'select', 
12:           options: [{ value: '1', label: 'Activo' }, { value: '0', label: 'Inactivo' }] 
13:         },
```
- **Líneas 8-13:** **Configuración Estructurada (Data-Driven).** En lugar de hacer manualmente un input de texto para el nombre, un select para el estado, etc., se crea un array de objetos (`availableFields`). Esto le dice al componente `DynamicFilters` cómo debe dibujar la interfaz gráficamente (si debe ser un `input type="text"` o un `<select>`). 

```javascript
37:     const [activeFilters, setActiveFilters] = useState([]);
```
- **Línea 37:** `activeFilters` mantiene un diccionario en memoria de qué filtros ha activado el usuario. Ejemplo: `{ nombre: "Matemática", estado: "1" }`.

```javascript
39:     const handleApplyFilters = (key, value) => {
40:         const newFilters = { ...activeFilters, [key]: value };
41:         router.get(route('materias.index'), 
42:         newFilters, {
43:             preserveScroll: true,
44:             preserveState: true,
45:             replace: true,
46:         });
47:     };
```
- **Líneas 39-47:** **El Motor de Búsqueda SPA (Single Page Application).** 
  - La línea 40 clona los filtros actuales (`...activeFilters`) y les agrega/modifica el nuevo valor.
  - La línea 41 hace la petición GET a la misma ruta en la que estamos (`materias.index`), pasándole el diccionario de filtros. Inertia convertirá esto mágicamente en la URL `?nombre=Matematica&estado=1`.
  - Lo más importante está en las opciones: 
    - `preserveScroll: true`: La pantalla no se mueve hacia arriba al buscar.
    - `preserveState: true`: Si tenías otros campos o modales abiertos, no se cierran ni pierden su valor.
    - `replace: true`: Reemplaza la URL en el historial del navegador para que si el usuario aprieta el botón "Atrás" de Chrome, no tenga que pasar por 50 versiones distintas del filtro.

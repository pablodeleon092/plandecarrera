# Análisis Línea por Línea: Componente `AsignarCarrerasCoordinador.jsx`

Esta es una de las vistas más complejas y modernas del proyecto porque implementa "Drag & Drop" (Arrastrar y Soltar) en React.

```javascript
6: import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
```
- **Línea 6:** Importa la librería `react-beautiful-dnd`. Esto requiere tres conceptos:
  - `DragDropContext`: Envuelve todo el área donde ocurrirá la magia.
  - `Droppable`: Define las "zonas" donde puedes soltar elementos (La lista de asignadas y la de disponibles).
  - `Draggable`: Cada tarjeta individual que puedes agarrar con el mouse.

```javascript
15:     const onDragEnd = (result) => {
16:         const { source, destination } = result;
17:         if (!destination) return; // Si soltó la tarjeta fuera de una lista, no hacer nada
```
- **Líneas 15-17:** La función vital. Se ejecuta en el instante en que el usuario suelta el click. `source` es de dónde venía la tarjeta, `destination` es dónde la soltó.

```javascript
30:         // Mover el elemento
31:         const [moved] = sourceList.splice(source.index, 1);
32:         destList.splice(destination.index, 0, moved);
```
- **Líneas 30-32:** **Mutación de Arrays en memoria.** Usando el método `splice` de Javascript, saca la carrera de la lista origen (`sourceList`) y la inserta exactamente en el índice (`destination.index`) donde el usuario la soltó en la lista destino (`destList`).

```javascript
57:     // Sincronizar form data con el estado de las carreras asignadas
58:     useEffect(() => {
59:         setData('carreras_ids', carrerasCoordinador.map(c => c.id));
60:     }, [carrerasCoordinador]);
```
- **Líneas 57-60:** **Sincronización Reactiva.** Cada vez que el usuario suelta una tarjeta y el array `carrerasCoordinador` cambia, este `useEffect` extrae todos los IDs (`[2, 5, 8]`) y los actualiza en el formulario de Inertia (`setData`). De esta forma, cuando el usuario presiona "Guardar", el frontend ya tiene el array de IDs perfecto listo para enviarle a Laravel (que vimos que usa `sync()` en el controlador).

```javascript
119:                                     <Droppable droppableId="carrerasCoordinador">
120:                                         {(provided) => (
121:                                             <div ref={provided.innerRef} {...provided.droppableProps} ...>
```
- **Líneas 119-121:** **Render Props Pattern.** La librería te obliga a pasarle una función como hijo `(provided) => (...)`. `provided.innerRef` y `droppableProps` son inyecciones automáticas que la librería hace sobre tus etiquetas `<div>` para tomar el control de los eventos del mouse.

# Análisis Línea por Línea: Componente `DataTable.jsx`

Este componente es una de las joyas de tu Frontend. Es un componente reutilizable que te ahorra escribir miles de líneas de código `HTML` de tablas repetidas.

```javascript
4: export default function DataTable({
5:     columns = [],
6:     data = [],
7:     onShow,
8:     onEdit,
...
19: }) {
```
- **Líneas 4-19:** **Props Destructuring.** El componente acepta muchísimas propiedades (Props). Toma los datos crudos (`data`), cómo quiere dibujarlos el padre (`columns`), y un montón de funciones condicionales (`onShow`, `onEdit`).

```javascript
29:     const ActionButtons = ({ item }) => {
30:         // Si el item no trae objeto 'can', por defecto permitimos (para no romper otros modelos)
31:         // Pero si lo trae, respetamos lo que diga el servidor.
32:         const permissions = item.can || { view: true, update: true, delete: true, toggle: true };
```
- **Líneas 29-32:** **Seguridad desde Laravel hasta React.** ¿Recuerdas en los controladores que al hacer el `.map()` pasábamos una propiedad `can` con permisos según Spatie? Este componente lee esos permisos que llegaron en el JSON (`item.can.view`).

```javascript
36:                 {onShow && permissions.view && (
37:                     <IconButton action="show" item={item} onShow={onShow} />
38:                 )}
```
- **Líneas 36-38:** **Renderizado Condicional (Short-circuit).** El botón del "Ojito" (ver detalle) *solo* se va a dibujar en la pantalla si el componente padre le pasó una función `onShow` **Y** si el servidor dijo que este usuario tiene permiso para verlo (`permissions.view === true`). Así se ocultan los botones prohibidos.

```javascript
105:                                         <td
...
110:                                             {col.render ? col.render(item) : item[col.key]}
111:                                         </td>
```
- **Líneas 105-111:** **Lógica de Dibujado Dinámico.** Este es el núcleo de la tabla. Al recorrer cada fila, revisa la columna. ¿El padre mandó una función `render` personalizada para esta columna? Si sí, ejecuta esa función (`col.render(item)`). Si no, simplemente imprime el valor crudo como texto plano (`item[col.key]`). Esto da una flexibilidad inmensa.

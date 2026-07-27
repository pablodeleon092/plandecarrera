# Análisis Línea por Línea: Componente `Index.jsx` (Materias)

Este archivo muestra cómo listar datos de Laravel en React de forma elegante y rápida.

```javascript
13:     const handleDelete = (id) => {
14:         if (confirm('¿Estás seguro de eliminar esta materia?')) {
15:             router.delete(route('materias.destroy', id));
16:         }
17:     };
```
- **Líneas 13-17:** La eliminación se delega al `router` de Inertia. Este `route()` mágico no es de React, es de la librería `Ziggy` que traduce las rutas nombradas de PHP (`materias.destroy`) a URLs para que React pueda usarlas.

```javascript
19:     const handleToggleStatus = (materia) => {
20:         router.patch(route('materias.toggleStatus', materia), {}, {
21:             preserveScroll: true
22:         });
23:     };
```
- **Líneas 19-23:** **Preservar Scroll.** Cuando cambias el estado de "Activo" a "Inactivo", la página no se recarga, pero el estado viaja al backend y vuelve. Al pasar `preserveScroll: true`, evitas que el usuario sea forzado a volver a la parte superior de la pantalla, brindando una experiencia "Single Page Application" perfecta.

```javascript
27:     const materiasActivas = useMemo(() => materias.data.filter(m => m.estado).length, [materias.data]);
```
- **Línea 27:** **El Hook `useMemo` (Memorización).** Esto es clave para el rendimiento de React. En lugar de ejecutar el filtro `filter(m => m.estado)` *cada vez* que el componente se renderiza o alguien mueve el mouse, `useMemo` hace el cálculo una sola vez y guarda ("cachea") el resultado de materias activas. Solo volverá a recalcular si `materias.data` cambia.

```javascript
65:                         <DataTable
66:                             columns={[
...
70:                                     key: 'regimen',
71:                                     label: 'Régimen',
72:                                     render: (m) => (
73:                                         <span className="..."> {m.regimen} </span>
```
- **Líneas 65-73:** **Componentización.** En lugar de armar la estructura de la tabla HTML (`<table><tbody><tr>`) aquí mismo, se llama a un componente reutilizable `<DataTable />`. Se le pasa un objeto de configuración (`columns`). La maravilla aquí es la propiedad `render: (m) => (...)`, que permite pasarle al componente hijo *cómo queremos que dibuje* una celda específica (en este caso, una pastilla coloreada para el Régimen).

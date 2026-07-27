# Análisis Línea por Línea: Componente `PaginatorButtons.jsx`

La paginación en una Single Page Application (SPA) puede ser muy complicada, pero este archivo muestra cómo Inertia lo resuelve elegantemente.

```javascript
4: export default function PaginatorButtons({ meta = null, paginator = null, onPageChange = null, routeName = null, routeParams = {}, window = 2 }) {
```
- **Línea 4:** Recibe propiedades (Props) súper flexibles. `meta` es el objeto de metadatos de paginación que Laravel envía por defecto cuando usas `->paginate(10)` en Eloquent. `routeParams` permite recibir los filtros activos de búsqueda, para que cuando cambies de página, no se borre lo que el usuario estaba buscando.

```javascript
23:     const goTo = (page) => {
...
27:         const allParams = { ...routeParams, page };
28:         
29:         // El método router.get es la forma recomendada para Inertia.
30:         router.get(route(routeName, allParams), {}, {
31:             preserveScroll: true,
32:             preserveState: true,
33:             replace: true,
34:         });
35:     };
```
- **Líneas 23-35:** **La Función de Navegación.** 
  - Al hacer click en "Página 2", se ejecuta `goTo(2)`.
  - La línea 27 es crucial: fusiona los parámetros actuales (ej. `{ nombre: 'Matemática' }`) con la nueva página (`{ nombre: 'Matemática', page: 2 }`).
  - Luego hace un `router.get` silente (sin recargar la pestaña del navegador). `preserveScroll: true` evita el clásico y molesto salto brusco hacia arriba que tienen las tablas web antiguas al cambiar de página.

```javascript
40:     const pages = [];
41:     const start = Math.max(1, current_page - window);
42:     const end = Math.min(last_page, current_page + window);
```
- **Líneas 40-42:** **Algoritmo de Ventana Deslizante.** Si tienes 100 páginas, no quieres dibujar 100 botones. `window = 2` significa que si estás en la página 10, solo dibujará [8, 9, 10, 11, 12].

```javascript
77:             <div className="paginator-text">
78:                 {`Página ${current_page} de ${last_page}`}
79:             </div>
...
90:                 {finalPages.map((p, index) => (
91:                     p === '...' ? (
92:                         <span key={index} className="paginator-ellipsis">...</span>
93:                     ) : (
94:                         <button ...> {p} </button>
```
- **Líneas 77-94:** Dibuja el texto informativo ("Página 2 de 50") y utiliza un `.map` para dibujar los botones. Si en el array de la ventana deslizante hay un texto de puntos suspensivos (`'...'`), dibuja un `<span>` en lugar de un botón para indicarle al usuario que hay más páginas ocultas.

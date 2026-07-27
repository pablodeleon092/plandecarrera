# Análisis Línea por Línea: Hook Personalizado `usePermissions.js`

Este archivo es extremadamente pequeño pero es una técnica avanzada de React conocida como **Custom Hooks (Ganchos Personalizados)**.

```javascript
4: export function usePermissions() {
5:     // Obtenemos los datos globales que Laravel envía a través de Inertia
6:     const { auth } = usePage().props;
```
- **Líneas 4-6:** Crea una función exportable que, por convención en React, debe empezar con la palabra `use`. Internamente utiliza el hook de Inertia (`usePage`) para interceptar la propiedad `auth` (donde viene el usuario logueado).

```javascript
8:     const permissions = auth?.user?.permissions || [];
```
- **Línea 8:** **Encadenamiento Opcional (Optional Chaining `?.`).** Si por alguna razón el usuario no está logueado o la sesión expiró justo en ese milisegundo, `auth.user` sería `null`. Si intentaras hacer `null.permissions`, la aplicación React explotaría entera mostrando una pantalla blanca de error. Poner `?.` hace que, si no existe el objeto, se asigne de forma segura un array vacío `[]` como valor por defecto (`|| []`).

```javascript
10:     return {
11:         // Devuelve booleanos listos para usar
12:         canViewUsers: permissions.includes('consultar_usuario'),
13:         canEditUsers: permissions.includes('modificar_usuario'),
14:         canViewCarreras: permissions.includes('modificar_carrera'),
```
- **Líneas 10-14:** **Mapeo de Diccionario a Booleanos.** 
  - La variable `permissions` es un array simple de textos que viene desde Laravel Spatie: `['consultar_usuario', 'crear_materia']`.
  - Esta función convierte esa lista en un objeto de booleanos fáciles de usar en inglés. 
  - Cuando un componente React hace: `const { canViewUsers } = usePermissions()`, `canViewUsers` simplemente será `true` o `false`. Esto evita que en cada componente de tu frontend tengas que andar escribiendo molestos `auth.user.permissions.includes(...)` cientos de veces. Centralización y código limpio en su máxima expresión.

# Análisis Línea por Línea: Componente `AuthenticatedLayout.jsx`

Este archivo envuelve toda la aplicación cuando el usuario ha iniciado sesión. Aquí es donde reside el Navbar (barra de navegación) superior y la lógica global.

```javascript
9: export default function AuthenticatedLayout({ header, children }) {
10:     const user = usePage().props.auth.user;
11:     const { auth } = usePage().props;
12:     const { canViewUsers } = usePermissions();
```
- **Líneas 9-12:** **Extracción de Estado Global.** 
  - A diferencia de las Apps clásicas en React que usan `Redux` o `Context API` para saber quién está logueado, Inertia proporciona el Hook `usePage().props`. Laravel inyecta el usuario (`auth.user`) globalmente en cada renderizado de página, y React lo atrapa aquí de manera sumamente sencilla.
  - El Custom Hook `usePermissions()` evalúa los permisos del usuario para decidir si puede ver o no ciertos botones.

```javascript
14:     const [showingNavigationDropdown, setShowingNavigationDropdown] =
15:         useState(false);
```
- **Líneas 14-15:** **Hook `useState` (Estado Local).** Se utiliza para la versión móvil. Mantiene en su memoria si el menú hamburguesa (las rayitas en los celulares) está abierto (`true`) o cerrado (`false`).

```javascript
82:                                 {canViewUsers && (
83:                                     <NavLink href={route('users.index')} active={route().current('users.index')}>
84:                                         Usuarios
85:                                     </NavLink>
86:                                 )}
```
- **Líneas 82-86:** **Navegación Protegida Visualmente.** El botón "Usuarios" en la barra de navegación superior no aparece para todo el mundo. Solo los administradores (aquellos donde `canViewUsers` sea `true`) verán este enlace. `route().current('users.index')` marca el botón como "Activo" (lo subraya y lo pone en negrita) si el usuario está actualmente en esa ruta.

```javascript
238:             <main>
239:                 <div className="py-12">
240:                     <div className="mx-auto w-[95%]">
241:                         {children}
242:                     </div>
243:                 </div>
244:             </main>
```
- **Líneas 238-244:** **Componente Contenedor (Wrapper).** La propiedad mágica `{children}` representa a todo el contenido que esté envuelto por `<AuthenticatedLayout>`. Por ejemplo, si un componente hace `<AuthenticatedLayout><Hola /></AuthenticatedLayout>`, `{children}` será `<Hola />`. Esto asegura que toda la aplicación tenga la misma barra superior (nav) sin importar en qué página te encuentres.

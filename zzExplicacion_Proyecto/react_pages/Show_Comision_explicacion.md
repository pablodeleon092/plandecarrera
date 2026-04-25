# Análisis Línea por Línea: Componente `Show.jsx` (Comisiones)

Este archivo es un gran ejemplo de cómo manejar **Pestañas (Tabs)** en React para dividir información compleja sin sobrecargar la pantalla y sin tener que crear múltiples URLs.

```javascript
10: export default function ShowComision({ auth, comision, flash, docentes, allDocentes }) {
11: 
12:     const [currentTab, setCurrentTab] = useState('informacion');
```
- **Líneas 10-12:** **Estado Local para Navegación.** 
  - El componente recibe todas las variables desde el controlador `ComisionController` en Laravel (comisión, docentes, etc.).
  - En lugar de usar Inertia para cambiar de página, se usa `useState('informacion')` para llevar un registro de qué pestaña está mirando el usuario ahora mismo. Por defecto, inicia en la pestaña "Información".

```javascript
106:                             <div className="flex gap-4">
107:                                 <button
108:                                     onClick={() => setCurrentTab('informacion')}
109:                                     className={`px-4 py-2 font-semibold transition border-b-2 ${currentTab === 'informacion'
...
117:                                 <button
118:                                     onClick={() => setCurrentTab('docentes')}
```
- **Líneas 106-118:** **Botones de Pestañas y Estilos Dinámicos.**
  - Cada botón tiene un evento `onClick` que simplemente cambia la variable de estado (`setCurrentTab`).
  - El diseño (TailwindCSS) usa *Template Literals* (las comillas invertidas ` ` `) para inyectar lógica dentro de las clases de CSS. Si `currentTab === 'informacion'`, el botón se pinta con borde azul (`border-blue-600`); si no, se pinta gris (`text-gray-500`).

```javascript
140:                         {/* Contenido dinámico */}
141:                         <div className="p-8">
142:                             {currentTab === 'informacion' && (
143:                                 <ComisionInfo comision={comision} />
144:                             )}
145:                             {currentTab === 'docentes' && (
146:                                 <ComisionDocentes
147:                                     comision={comision}
148:                                     docentes={docentes}
149:                                     allDocentes={allDocentes}
150:                                 />
151:                             )}
```
- **Líneas 140-151:** **Renderizado Condicional.** 
  - Usando el operador lógico `&&` (AND), React evalúa: "¿`currentTab` es igual a 'docentes'?". Si es falso, React ignora esa línea y no dibuja nada. Si es verdadero, React dibuja el componente `<ComisionDocentes />`.
  - Esta técnica permite que el código de la vista principal sea extremadamente limpio. En vez de escribir mil líneas de código de tablas de docentes y tablas de horarios aquí mismo, se delegan a subcomponentes (`Partials`), pasándoles las variables necesarias (Props) como `docentes={docentes}`.

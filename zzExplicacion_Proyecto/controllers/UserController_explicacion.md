# Análisis Línea por Línea: Controlador `UserController.php`

El controlador de usuarios no solo crea credenciales de acceso, sino que mapea puestos de trabajo con **Roles de Spatie** en la base de datos.

```php
69:                 'password' => Hash::make($request->password),
```
- **Línea 69:** Jamás se guardan las contraseñas en texto plano. La clase `Hash` de Laravel las encripta automáticamente con Bcrypt/Argon2.

```php
81:         $user->assignRole($this->getDefaultRoleForCargo($request->cargo));
```
- **Línea 81:** El paquete `Spatie/laravel-permission` agrega el método mágico `assignRole()` al modelo User. Aquí lo llama pasándole el resultado de una función interna que decide qué rol le toca según el trabajo que seleccionó.

```php
154:         // Prevent deleting the currently authenticated user from the user-management UI
155:         if (Auth::id() === $user->id) {
156:             return redirect(route('users.index'))->with('error', 'No puedes eliminar tu propio usuario desde aquí.');
157:         }
```
- **Líneas 154-157:** **Prevención de Suicidio Lógico.** Verifica si la ID del administrador logueado (`Auth::id()`) es la misma que la del usuario que se está intentando borrar (`$user->id`). Si lo es, bloquea la acción. Sin esto, un administrador podría borrarse a sí mismo, su sesión moriría, y podría dejar el sistema sin administradores activos.

```php
179:         $carrerasRestantes = $carreras->diff($carrerasAsignadas);
```
- **Línea 179:** **Colecciones (Collections).** En el flujo para asignar carreras a un coordinador, obtiene las que *tiene*, obtiene *todas* las posibles, y utiliza la función de colecciones `diff()`. Esto funciona igual que la diferencia de conjuntos en matemáticas. Si `A = [1,2,3]` y `B = [2]`, la diferencia es `[1,3]`. Así envía al frontend solo las opciones que aún no ha seleccionado.

```php
188:     public function updateCarrerasCoordinador(Request $request, User $user)
189:     {
190:         $validated = $request->validate([
191:             'carreras_ids' => 'nullable|array',
192:             'carreras_ids.*' => 'exists:carreras,id', 
193:         ]);
194: 
195:         $user->carreras()->sync($validated['carreras_ids'] ?? []);
196:     }
```
- **Líneas 188-196:** **Sincronización (Sync).** Cuando editas un componente múltiple (como check-boxes), a veces desmarcas una carrera y marcas dos nuevas. Averiguar cuáles borrar y cuáles insertar manualmente en SQL es difícil. El método `sync()` toma el array (ej. `[2, 5]`) y hace el trabajo por ti: borra todo lo que el usuario tenía y solo deja `[2, 5]`. Si llega vacío (`[]`), borra todo.

```php
207:     private function getDefaultRoleForCargo(string $cargo)
208:     {
209:         $cargoRoleMap = [
210:             'Administrador' => 'Admin',
211:             'Administrativo de Secretaria Academica' => 'Admin_global',
212:             'Administrativo de instituto' => 'Admin_instituto', 
213:             'Coordinador de Carrera' => 'Coord_carrera', 
214:         ];
215: 
216:         return $cargoRoleMap[$cargo] ?? 'user';
217:     }
```
- **Líneas 207-217:** **Mapeo (Diccionario).** Un patrón limpio (evita los `if/else` gigantes o los `switch`). Utiliza el operador de fusión nula (`??`) para que, si el nombre del cargo falla o no coincide, le asigne un rol genérico `user` por seguridad.

<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Instituto;
use Spatie\Permission\Models\Role;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{


    /**
     * Display the registration view.
     */
    public function index()
    {
        $this->authorize('index', User::class);


        $users = User::with('instituto')->orderBy('id', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    public function create(Request $request)
    {
        $this->authorize('create', User::class);

        return Inertia('Users/Auth/Register', [
            'institutos' => Instituto::select('id', 'siglas')->get(),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        \Log::debug($request->all());

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'dni' => 'required|integer|unique:' . User::class,
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'cargo' => 'required|string|max:255',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'instituto_id' => 'nullable|integer|exists:institutos,id',
        ]);

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'dni' => $request->dni,
                'nombre' => $request->nombre,
                'apellido' => $request->apellido,
                'is_activo' => true,
                'cargo' => $request->cargo,
                'instituto_id' => $request->instituto_id,
            ]);
        } catch (\Exception $e) {
            dd($e->getMessage());
        }

        $user->assignRole($this->getDefaultRoleForCargo($request->cargo));



        return redirect(route('users.index'))->with('success', 'Usuario creado exitosamente.');
    }

    public function edit(User $user)
    {
        if (!Auth::user()->can('modificar_usuario')) {
            abort(403, 'No tienes permiso para modificar usuarios.');
        }

        $institutos = Instituto::select('id', 'siglas')->get();

        return inertia('Users/Edit', [
            'user' => $user,
            'institutos' => $institutos,
        ]);
    }

    public function show(User $user)
    {
        $user->load('instituto');
        return inertia('Users/Show', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'dni' => 'required|integer|unique:users,dni,' . $user->id,
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'cargo' => 'required|string|max:255',
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'instituto_id' => 'nullable|integer|exists:institutos,id',
        ]);

        try {
            $user->update([
                'name' => $request->name,
                'email' => $request->email,
                'dni' => $request->dni,
                'nombre' => $request->nombre,
                'apellido' => $request->apellido,
                'cargo' => $request->cargo,
                'instituto_id' => $request->instituto_id ?: null,
                'password' => $request->password ? Hash::make($request->password) : $user->password,
            ]);
            $user->syncRoles($this->getDefaultRoleForCargo($request->cargo));
        } catch (\Exception $e) {
            \Log::error('Error actualizando usuario: ' . $e->getMessage());
            return back()->with('error', 'Hubo un problema al actualizar el usuario.');
        }

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'institutos' => Instituto::select('id', 'siglas')->get(),
            'flash' => ['success' => 'Usuario actualizado correctamente.'],
        ]);
    }

    public function destroy(User $user)
    {
        $this->authorize('update', $user);

        // Prevent deleting the currently authenticated user from the user-management UI
        if (Auth::id() === $user->id) {
            return redirect(route('users.index'))->with('error', 'No puedes eliminar tu propio usuario desde aquí.');
        }

        try {
            $user->delete();
        } catch (\Exception $e) {
            \Log::error('Error eliminando usuario: ' . $e->getMessage());
            return back()->with('error', 'Hubo un problema al eliminar el usuario.');
        }

        return redirect(route('users.index'))->with('success', 'Usuario eliminado correctamente.');
    }

    public function carrerasCoordinador(User $user)
    {

        $this->authorize('update', $user);

        $user->load('carreras', 'instituto');

        $carrerasAsignadas = $user->carreras;
        $carreras = $user->instituto->carreras;

        $carrerasRestantes = $carreras->diff($carrerasAsignadas);

        return inertia('Users/AsignarCarrerasCoordinador', [
            'coordinador' => $user->only('id', 'nombre', 'apellido'),
            'carrerasAsignadas' => $carrerasAsignadas,
            'carrerasRestantes' => $carrerasRestantes
        ]);
    }

    public function updateCarrerasCoordinador(Request $request, User $user)
    {

        $validated = $request->validate([
            'carreras_ids' => 'nullable|array',
            'carreras_ids.*' => 'exists:carreras,id', // Asume que la tabla es 'carreras'
        ]);


        $user->carreras()->sync($validated['carreras_ids'] ?? []);


        return redirect()
            ->route('coordinadores.carreras.edit', $user) // Redirige de vuelta a la vista de edición
            ->with('success', 'Asignación de carreras actualizada con éxito.');
    }



    private function getDefaultRoleForCargo(string $cargo)
    {
        $cargoRoleMap = [
            'Administrador' => 'Admin',
            'Administrativo de Secretaria Academica' => 'Admin_global',
            'Administrativo de instituto' => 'Admin_instituto',
            'Coordinador de Carrera' => 'Coord_carrera',
            'Director de instituto' => 'Consulta_instituto',
            'Coordinador Academico' => 'Consulta_instituto',
            'Consejero' => 'Consulta_instituto',
        ];

        return $cargoRoleMap[$cargo] ?? 'user'; // Rol por defecto si no se encuentra el cargo
    }

    public function toggleStatus(User $user)
    {
        $this->authorize('update', $user);

        if (Auth::id() === $user->id) {
            return back()->with('error', 'No puedes desactivar tu propio usuario.');
        }

        try {
            $user->is_activo = !$user->is_activo;
            $user->save();
        } catch (\Exception $e) {
            \Log::error('Error cambiando estado de usuario: ' . $e->getMessage());
            return back()->with('error', 'Hubo un problema al cambiar el estado del usuario.');
        }

        $status = $user->is_activo ? 'activado' : 'desactivado';
        return back()->with('success', "Usuario {$status} correctamente.");
    }
}

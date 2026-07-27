<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Instituto;
use Spatie\Permission\Models\Role;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    private const PENDING_COORDINATOR_SESSION_KEY = 'pending_coordinator';

    /**
     * Display the registration view.
     */
    public function index()
    {
        $this->authorize('index', User::class);
        $authUser = Auth::user();


        $users = User::with('instituto')
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($model) => array_merge($model->toArray(), [
                'can' => [
                    'view' => $authUser->can('show', $model),
                    'update' => $authUser->can('update', $model),
                    'delete' => $authUser->can('delete', $model),
                ],
            ]));

        return Inertia::render('Users/Index', [
            'users' => $users,
            'can' => [
                'create' => $authUser->can('create', User::class),
            ],
        ]);
    }

    public function create(Request $request)
    {
        $this->authorize('create', User::class);

        return Inertia('Users/Auth/Register', [
            'institutos' => Instituto::select('id', 'siglas')->get(),
            'pendingUser' => Arr::except(
                $request->session()->get(self::PENDING_COORDINATOR_SESSION_KEY, []),
                ['password', 'is_activo']
            ),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', User::class);
        $this->normalizeEmail($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:' . User::class,
            'dni' => 'required|integer|unique:' . User::class,
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'cargo' => 'required|string|max:255',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'instituto_id' => 'nullable|required_if:cargo,Coordinador de Carrera|integer|exists:institutos,id',
        ]);

        if ($validated['cargo'] === 'Coordinador de Carrera') {
            $request->session()->put(self::PENDING_COORDINATOR_SESSION_KEY, [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'dni' => $validated['dni'],
                'nombre' => $validated['nombre'],
                'apellido' => $validated['apellido'],
                'is_activo' => true,
                'cargo' => $validated['cargo'],
                'instituto_id' => $validated['instituto_id'],
            ]);

            return redirect()
                ->route('users.coordinator-carreras.create')
                ->with('success', 'Asignale al menos una carrera para completar la creación del usuario.');
        }

        $request->session()->forget(self::PENDING_COORDINATOR_SESSION_KEY);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'dni' => $validated['dni'],
                'nombre' => $validated['nombre'],
                'apellido' => $validated['apellido'],
                'is_activo' => true,
                'cargo' => $validated['cargo'],
                'instituto_id' => $validated['instituto_id'],
            ]);
        } catch (\Exception $e) {
            dd($e->getMessage());
        }

        $user->assignRole($this->getDefaultRoleForCargo($validated['cargo']));

        return redirect(route('users.index'))->with('success', 'Usuario creado exitosamente.');
    }

    public function edit(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $institutos = Instituto::select('id', 'siglas')->get();

        return inertia('Users/Edit', [
            'user' => $user,
            'institutos' => $institutos,
            'returnTo' => $request->query('from') === 'show' ? 'show' : 'index',
        ]);
    }

    public function show(User $user)
    {
        $this->authorize('show', $user);
        $authUser = Auth::user();

        $user->load('instituto');
        return inertia('Users/Show', [
            'user' => $user,
            'can' => [
                'view' => $authUser->can('show', $user),
                'update' => $authUser->can('update', $user),
                'delete' => $authUser->can('delete', $user),
            ],
        ]);
    }

    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);
        $this->normalizeEmail($request);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'dni' => 'required|integer|unique:users,dni,' . $user->id,
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'cargo' => 'required|string|max:255',
            'instituto_id' => 'nullable|integer|exists:institutos,id',
            'return_to' => 'nullable|in:index,show',
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
            ]);
            $user->syncRoles($this->getDefaultRoleForCargo($request->cargo));
        } catch (\Exception $e) {
            \Log::error('Error actualizando usuario: ' . $e->getMessage());
            return back()->with('error', 'Hubo un problema al actualizar el usuario.');
        }

        $returnRoute = $request->input('return_to') === 'show'
            ? route('users.show', $user)
            : route('users.index');

        $request->session()->flash('success', 'Usuario actualizado correctamente.');

        return Inertia::location($returnRoute);
    }

    public function updatePassword(Request $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            $user->update([
                'password' => Hash::make($validated['password']),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error actualizando contraseña de usuario: '.$e->getMessage());

            return back()->with('error', 'Hubo un problema al actualizar la contraseña.');
        }

        return back()->with('success', 'Contraseña actualizada correctamente.');
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

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

    public function createCoordinatorCarreras(Request $request): Response|RedirectResponse
    {
        $this->authorize('create', User::class);

        $pendingCoordinator = $request->session()->get(self::PENDING_COORDINATOR_SESSION_KEY);

        if (!$pendingCoordinator || $pendingCoordinator['cargo'] !== 'Coordinador de Carrera') {
            return redirect()
                ->route('users.create')
                ->with('error', 'No hay un coordinador pendiente de creación.');
        }

        $instituto = Instituto::find($pendingCoordinator['instituto_id']);

        if (!$instituto) {
            return redirect()
                ->route('users.create')
                ->withErrors([
                    'instituto_id' => 'El instituto seleccionado ya no está disponible.',
                ]);
        }

        return inertia('Users/AsignarCarrerasCoordinador', [
            'coordinador' => Arr::only($pendingCoordinator, ['nombre', 'apellido']),
            'carrerasAsignadas' => [],
            'carrerasRestantes' => $instituto->carreras()->orderBy('nombre')->get(),
            'creationMode' => true,
        ]);
    }

    public function storeCoordinatorWithCarreras(Request $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $pendingCoordinator = $request->session()->get(self::PENDING_COORDINATOR_SESSION_KEY);

        if (!$pendingCoordinator || $pendingCoordinator['cargo'] !== 'Coordinador de Carrera') {
            return redirect()
                ->route('users.create')
                ->with('error', 'No hay un coordinador pendiente de creación.');
        }

        $validated = $request->validate([
            'carreras_ids' => ['required', 'array', 'min:1'],
            'carreras_ids.*' => [
                'integer',
                Rule::exists('carreras', 'id')->where(
                    fn ($query) => $query->where(
                        'instituto_id',
                        $pendingCoordinator['instituto_id']
                    )
                ),
            ],
        ]);

        $pendingValidator = Validator::make($pendingCoordinator, [
            'email' => ['required', 'email', Rule::unique('users', 'email')],
            'dni' => ['required', 'integer', Rule::unique('users', 'dni')],
            'instituto_id' => ['required', 'integer', Rule::exists('institutos', 'id')],
        ]);

        if ($pendingValidator->fails()) {
            return redirect()
                ->route('users.create')
                ->withErrors($pendingValidator)
                ->with('error', 'Los datos del coordinador cambiaron. Revisalos antes de continuar.');
        }

        try {
            $user = DB::transaction(function () use ($pendingCoordinator, $validated) {
                $user = User::create($pendingCoordinator);
                $user->assignRole(
                    $this->getDefaultRoleForCargo($pendingCoordinator['cargo'])
                );
                $user->carreras()->sync($validated['carreras_ids']);

                return $user;
            });
        } catch (\Throwable $exception) {
            \Log::error('Error creando coordinador con carreras: '.$exception->getMessage());

            return back()->with(
                'error',
                'Hubo un problema al crear el coordinador. No se guardó ningún cambio.'
            );
        }

        $request->session()->forget(self::PENDING_COORDINATOR_SESSION_KEY);

        return redirect()
            ->route('users.show', $user)
            ->with('success', 'Usuario creado y carreras asignadas correctamente.');
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
            'carrerasRestantes' => $carrerasRestantes,
            'creationMode' => false,
        ]);
    }

    public function updateCarrerasCoordinador(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'carreras_ids' => 'nullable|array',
            'carreras_ids.*' => 'exists:carreras,id', // Asume que la tabla es 'carreras'
        ]);


        $user->carreras()->sync($validated['carreras_ids'] ?? []);


        return redirect()
            ->route('users.show', $user)
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

    private function normalizeEmail(Request $request): void
    {
        if ($request->has('email')) {
            $request->merge([
                'email' => Str::lower(trim((string) $request->input('email'))),
            ]);
        }
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

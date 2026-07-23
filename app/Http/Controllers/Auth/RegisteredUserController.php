<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Instituto;
use Spatie\Permission\Models\Role;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{


    /**
     * Display the registration view.
     */
    public function create(Request $request)
    {

    try {
        $this->authorize('create', User::class);
    } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
        return redirect()->route('dashboard')->with('error', 'No tienes permisos para crear usuarios.');
    }

    return Inertia('Auth/Register', [
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

        if ($request->has('email')) {
            $request->merge([
                'email' => Str::lower(trim((string) $request->input('email'))),
            ]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:'.User::class,
            'dni' => 'required|integer|unique:'.User::class,
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

        #event(new Registered($user));

        return redirect(route('dashboard'))->with('success', 'Usuario creado exitosamente.');
    }

    private function getDefaultRoleForCargo($cargo)
    {
        $cargoRoleMap = [
            'Administrador' => 'admin',
            'Administrativo de Secretaria Academica' => 'Admin_global',
            'Administrativo de instituto' => 'Admin_instituto',
            'Coordinador de Carrera' => 'Coord_carrera',
            'Director de instituto' => 'Consulta_instituto',
            'Coordinador Academico' => 'Consulta_instituto',
            'Consejero' => 'Consulta_instituto',
        ];

        return $cargoRoleMap[$cargo] ?? 'user'; // Rol por defecto si no se encuentra el cargo
    }
}

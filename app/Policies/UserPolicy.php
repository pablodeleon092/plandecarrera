<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Si el usuario puede llegar al index de User
     */

    public function index(User $user): bool
    {
        return ($user->hasRole('Admin')) or (($user->can('consultar_usuario')));

    }

    /**
     * Si el usuario puede llegar al show de User
     */
    public function show(User $user): bool
    {
        return ($user->can('consultar_usuario') or $user->id === $model->id);

    }

    /**
     * Si el usuario puede crear Usarios.
     */
    public function create(User $user): bool
    {
        return ($user->hasRole('Admin')) or ($user->can('crear_usuario'));
    }

    /**
     * Si el usuario puede actualizar informacion de otros usuarios
     */
    public function update(User $user): bool
    {
        return ($user->can('modificar_usuario'));
    }


}

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
        return $user->isAdministrator();

    }

    /**
     * Si el usuario puede llegar al show de User
     */
    public function show(User $user, User $model): bool
    {
        return $user->isAdministrator();

    }

    /**
     * Si el usuario puede crear Usarios.
     */
    public function create(User $user): bool
    {
        return $user->isAdministrator();
    }

    /**
     * Si el usuario puede actualizar informacion de otros usuarios
     */
    public function update(User $user, User $model): bool
    {
        return $user->isAdministrator();
    }

    public function delete(User $user, User $model): bool
    {
        return $user->isAdministrator();
    }


}

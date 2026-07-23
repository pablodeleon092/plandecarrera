<?php

namespace App\Policies;

use App\Models\Carrera;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CarreraPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('consultar_carrera');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Carrera $carrera): bool
    {
        if (!$user->can('consultar_carrera')) {
            return false;
        }

        if (!$user->instituto_id) {
            return true;
        } else {
            return $user->instituto_id == $carrera->instituto_id;
        }
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('crear_carrera');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Carrera $carrera): bool
    {

        if (!$user->can('modificar_carrera')) {
            return false;
        }

        if (!$user->instituto_id) {
            return true;
        } else {
            return $user->instituto_id == $carrera->instituto_id;
        }
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Carrera $carrera): bool
    {
        return $user->isAdministrator();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Carrera $carrera): bool
    {
        if (!$user->can('restore_carrera')) {
            return false;
        }

        if (!$user->instituto_id) {
            return true;
        }

        return $user->instituto_id == $carrera->instituto_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Carrera $carrera): bool
    {
        return false;
    }
}

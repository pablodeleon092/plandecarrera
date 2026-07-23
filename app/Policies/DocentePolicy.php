<?php

namespace App\Policies;

use App\Models\Docente;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DocentePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('consultar_docente');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('crear_docente');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Docente $docente): bool
    {
        if (!$user->can('modificar_docente') || !$docente->es_activo) {
            return false;
        }

        return $this->userPerteneceADocente($user, $docente);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Docente $docente): bool
    {
        return $user->isAdministrator();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Docente $docente): bool
    {
        if (!$user->can('restore_docente')) {
            return false;
        }

        return $this->userPerteneceADocente($user, $docente);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Docente $docente): bool
    {
        return false;
    }

    private function userPerteneceADocente(User $user, Docente $docente): bool
    {
        if (!$user->instituto_id) {
            return true;
        }

        // 1. Si el docente tiene materias en el instituto del usuario, tiene permiso
        $perteneceAlInstituto = Docente::deInstituto($user->instituto_id)
            ->where('docentes.id', $docente->id)
            ->exists();

        if ($perteneceAlInstituto) {
            return true;
        }

        // 2. Si el docente NO tiene NINGUNA materia asignada en todo el sistema, 
        // permitimos que el director lo gestione (caso de docente recién creado)
        return !$docente->dictas()->exists();
    }
}

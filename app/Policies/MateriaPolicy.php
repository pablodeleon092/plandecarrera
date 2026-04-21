<?php

namespace App\Policies;

use App\Models\Materia;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class MateriaPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('consultar_materia');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Materia $materia): bool
    {
        if (!$user->can('consultar_materia')) {
            return false;
        }


        if (!$user->instituto_id) {
            return true;
        }


        if ($user->carreras()->exists()) {
            $carrerasIds = $user->carreras->pluck('id');
            
            return $materia->whereHas('planes', function ($q) use ($carrerasIds) {
                $q->whereIn('carrera_id', $carrerasIds);
            })->where('id', $materia->id)->exists();
        }


        return Materia::byInstituto($user->instituto_id)
            ->where('materias.id', $materia->id)
            ->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
         return $user->can('crear_materia');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Materia $materia): bool
    {

        if (!$user->can('modificar_materia') || !$materia->activa) {
            return false;
        }


        return $this->userPerteneceAMateria($user, $materia);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Materia $materia): bool
    {

        if (!$user->can('eliminar_materia')) {
            return false;
        }

        return $this->userPerteneceAMateria($user, $materia);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Materia $materia): bool
    {
        if (!$user->can('restore_materia')) {
            return false;
        }

        return $this->userPerteneceAMateria($user, $materia);
    }

    private function userPerteneceAMateria(User $user, Materia $materia): bool
    {
        
        if (!$user->instituto_id) {
            return true;
        }

        if ($user->carreras()->exists()) {
            $carrerasIds = $user->carreras->pluck('id');
            
            return $materia->whereHas('planes', function ($q) use ($carrerasIds) {
                $q->whereIn('carrera_id', $carrerasIds);
            })->where('id', $materia->id)->exists();
        }


        return Materia::byInstituto($user->instituto_id)
            ->where('materias.id', $materia->id)
            ->exists();
    }
}

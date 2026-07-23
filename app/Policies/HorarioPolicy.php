<?php

namespace App\Policies;

use App\Models\Horario;
use App\Models\User;

class HorarioPolicy
{
    public function deleteAny(User $user): bool
    {
        return $user->canDeleteCommissionSchedules();
    }

    public function delete(User $user, Horario $horario): bool
    {
        return $this->deleteAny($user);
    }
}

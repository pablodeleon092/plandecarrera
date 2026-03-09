<?php
namespace App\Contracts;

use App\Models\User;
use Inertia\Response;
use Illuminate\Http\Request;

interface DashboardStrategy
{
    public function render(User $user, Request $request): Response;
}
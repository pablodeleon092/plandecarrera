<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',      // username para login
        'email',
        'password',
        'dni',
        'nombre',    // nombre real
        'apellido',
        'is_activo',
        'cargo',
        'instituto_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected function email(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => is_string($value)
                ? Str::lower(trim($value))
                : $value,
        );
    }
    
    public function carreras()
    {
        return $this->belongsToMany(Carrera::class, 'coordinador_carreras', 'user_id', 'carrera_id')
                    ->withTimestamps();
    }

    public function instituto()
    {
        return $this->belongsTo(Instituto::class);
    }

    public function isAdministrator(): bool
    {
        return $this->hasRole('Admin');
    }

    public function canDeleteCommissionSchedules(): bool
    {
        return $this->hasAnyRole(['Admin', 'Admin_global']);
    }

    public function getInstitutosAutorizados()
    {
        // 1. Administrador (o usuario sin instituto asignado) -> Acceso a todos
        if (!$this->instituto_id) {
            // Retorna colección de todos los institutos
            return Instituto::with('carreras.planActual')->get(['id', 'nombre']);
        }

        // 2. Coordinador de Carrera -> Tiene instituto PERO está limitado a ciertas carreras
        if ($this->carreras()->exists()) {
            
            $carreraIds = $this->carreras()->pluck('carreras.id'); // Obtenemos IDs de las carreras

            // Retornamos una colección con 1 solo instituto, pero filtramos sus carreras
            return Instituto::where('id', $this->instituto_id)
                ->select(['id', 'nombre'])
                ->with(['carreras' => function ($query) use ($carreraIds) {
                    $query->whereIn('carreras.id', $carreraIds)
                          ->with('planActual');
                }])
                ->get();
        }

        // 3. Consejero / Consulta -> Tiene instituto y NO tiene carreras específicas -> Acceso a todas las de su instituto
        return Instituto::where('id', $this->instituto_id)
            ->select(['id', 'nombre'])
            ->with('carreras.planActual')
            ->get();
    }

}

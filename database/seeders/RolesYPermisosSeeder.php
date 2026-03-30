<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolesYPermisosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permisos = [
            'consultar_usuario',
            'modificar_usuario',
            'modificar_permisos',
            'consultar_carrera',
            'modificar_carrera',
            'consultar_docente',
            'modificar_docente',
        ];

        foreach ($permisos as $permiso) {
            Permission::firstOrCreate(['name' => $permiso]);
        }

        // 🎯 ROLES MODIFICADOS:
        // Se ha retirado 'modificar_usuario' de 'Admin_instituto' y 'Coord_carrera'.
        $roles = [
            'Admin' => [
                'consultar_usuario', 
                'modificar_usuario',           
                'modificar_permisos', 
                'consultar_carrera', 
                'modificar_carrera', 
                'consultar_docente', 
                'modificar_docente'
            ],
            'Admin_global' => [
                'consultar_usuario', 
                'modificar_usuario',            
                'consultar_carrera', 
                'modificar_carrera', 
                'consultar_docente', 
                'modificar_docente'
            ],
            'Admin_instituto' => [
                //'consultar_usuario', 
                // 'modificar_usuario',         // ❌ ELIMINADO
                'consultar_carrera',
                'modificar_carrera', 
                'consultar_docente', 
                'modificar_docente'
            ], 
            'Coord_carrera' => [
                'consultar_carrera', 
                'modificar_carrera', 
                'consultar_docente', 
                'modificar_docente'
            ], 
            'Consulta_instituto' => [
                'consultar_carrera', 
                'consultar_docente'
            ],
            'Coordinador Academico' => [
                'consultar_carrera',
                'modificar_carrera',
                'consultar_docente',
                'modificar_docente'
            ],
        ];

        foreach ($roles as $rol => $permisosRol) {
            $role = Role::firstOrCreate(['name' => $rol]);
            // syncPermissions asegurará que solo se asignen los permisos definidos aquí.
            $role->syncPermissions($permisosRol);
        }

        $admin = User::firstOrCreate(
            ['email' => 'admin@domain.com'],
            [
                'name' => 'admin',
                'password' => Hash::make('admin123'),
                'dni' => '00000000',
                'nombre' => 'Administrador',
                'apellido' => 'Sistema',
                'is_activo' => true,
                'cargo' => 'Administrador',
                'instituto_id' => null,
            ]
        );

        $admin->assignRole('Admin');

    }

    




}
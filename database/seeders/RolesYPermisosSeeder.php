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
                'crear_usuario',
                'consultar_usuario', 
                'modificar_usuario',
                'restore_usuario',   
                'modificar_permisos',
                'crear_carrera', 
                'consultar_carrera', 
                'modificar_carrera',
                'restore_carrera',
                'crear_docente', 
                'consultar_docente', 
                'modificar_docente',
                'restore_docente',
                'crear_materia',
                'consultar_materia',
                'modificar_materia',
                'restore_materia',
                'crear_comision',
                'consultar_comision',
                'modificar_comision',
                'restore_comision'   
        ];

        foreach ($permisos as $permiso) {
            Permission::firstOrCreate(['name' => $permiso]);
        }

        $roles = [
            'Admin' => [
                'crear_usuario',
                'consultar_usuario', 
                'modificar_usuario',
                'restore_usuario',       
                'modificar_permisos',
                'crear_carrera', 
                'consultar_carrera', 
                'modificar_carrera',
                'restore_carrera',
                'crear_docente', 
                'consultar_docente', 
                'modificar_docente',
                'restore_docente',
                'crear_materia',
                'consultar_materia',
                'modificar_materia',
                'restore_materia',
                'crear_comision',
                'consultar_comision',
                'modificar_comision',
                'restore_comision'                 
            ],
            'Admin_global' => [
                'consultar_usuario', 
                'modificar_usuario',
                'restore_usuario',          
                'modificar_permisos',
                'crear_carrera', 
                'consultar_carrera', 
                'modificar_carrera',
                'restore_carrera',
                'crear_docente', 
                'consultar_docente', 
                'modificar_docente',
                'restore_docente',
                'crear_materia',
                'consultar_materia',
                'modificar_materia',
                'restore_materia',
                'crear_comision',
                'consultar_comision',
                'modificar_comision',
                'restore_comision'   
            ],
            'Admin_instituto' => [         
                'crear_carrera', 
                'consultar_carrera', 
                'modificar_carrera',
                'crear_docente', 
                'consultar_docente', 
                'modificar_docente',
                'crear_materia',
                'consultar_materia',
                'modificar_materia',
                'modificar_docente',
                'crear_comision',
                'consultar_comision',
                'modificar_comision' 
            ], 
            'Coord_carrera' => [
                'consultar_carrera', 
                'modificar_carrera',
                'consultar_materia',
                'modificar_materia',
                'modificar_docente',
                'crear_comision',
                'consultar_comision',
                'modificar_comision' 
            ], 
            'Consulta_instituto' => [
                'consultar_carrera',  
                'consultar_docente', 
                'consultar_materia',
                'consultar_comision',
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
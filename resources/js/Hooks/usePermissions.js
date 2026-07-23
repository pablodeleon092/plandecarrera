// resources/js/Hooks/usePermissions.js
import { usePage } from '@inertiajs/react';

export function usePermissions() {
    // Obtenemos los datos globales que Laravel envía a través de Inertia
    const { auth } = usePage().props;

    const permissions = auth?.user?.permissions || [];
    const roles = auth?.user?.roles || [];

    return {
        // Devuelve booleanos listos para usar
        canViewUsers: roles.includes('Admin'),
        canEditUsers: permissions.includes('modificar_usuario'),
        canViewCarreras: permissions.includes('modificar_carrera'),
        canEditCarreras: permissions.includes('modificar_carrera'),
        canCreateDocente: permissions.includes('crear_docente'),
        canEditDocente: permissions.includes('modificar_docente'),
        canDeleteDocente: roles.includes('Admin'),
        isAdmin: roles.includes('Admin'),
    };
}

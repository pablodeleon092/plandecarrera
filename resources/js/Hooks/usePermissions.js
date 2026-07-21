// resources/js/Hooks/usePermissions.js
import { usePage } from '@inertiajs/react';

export function usePermissions() {
    // Obtenemos los datos globales que Laravel envía a través de Inertia
    const { auth } = usePage().props;

    const permissions = auth?.user?.permissions || [];

    return {
        // Devuelve booleanos listos para usar
        canViewUsers: permissions.includes('consultar_usuario'),
        canEditUsers: permissions.includes('modificar_usuario'),
        canViewCarreras: permissions.includes('modificar_carrera'),
        canEditCarreras: permissions.includes('modificar_carrera'),
        canCreateDocente: permissions.includes('crear_docente'),
        canEditDocente: permissions.includes('modificar_docente'),
        canDeleteDocente: permissions.includes('restore_docente'),
        isAdmin: auth?.user?.role === 'admin', 
    };
}

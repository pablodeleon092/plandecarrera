import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                `nav-link ${
                    active ? 'nav-link-active' : 'nav-link-inactive'
                } ${className}`.trim()
            }
        >
            {children}
        </Link>
    );
}

import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                `responsive-nav-link ${
                    active ? 'responsive-nav-link-active' : 'responsive-nav-link-inactive'
                } ${className}`.trim()
            }
        >
            {children}
        </Link>
    );
}

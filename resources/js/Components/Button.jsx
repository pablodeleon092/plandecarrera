export default function Button({
    variant = 'primary',
    className = '',
    disabled,
    children,
    as: Component = 'button',
    ...props
}) {
    const variantClass = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'btn-danger',
        info: 'btn-info',
    }[variant] || 'btn-primary';

    // Para mantener el comportamiento exacto del viejo SecondaryButton
    const defaultType = variant === 'secondary' && Component === 'button' ? 'button' : undefined;

    return (
        <Component
            {...props}
            type={Component === 'button' && props.type === undefined ? defaultType : props.type}
            className={`${variantClass} ${disabled ? 'opacity-25' : ''} ${className}`.trim()}
            disabled={disabled}
        >
            {children}
        </Component>
    );
}

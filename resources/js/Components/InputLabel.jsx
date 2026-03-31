export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={`input-label ${className}`.trim()}
        >
            {value ? value : children}
        </label>
    );
}

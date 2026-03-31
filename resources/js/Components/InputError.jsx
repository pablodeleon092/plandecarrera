export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={`input-error ${className}`.trim()}
        >
            {message}
        </p>
    ) : null;
}

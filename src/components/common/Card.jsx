// Reusable Card component
export default function Card({
    children,
    hover = false,
    padding = 'md',
    className = '',
    onClick,
    ...props
}) {
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    return (
        <div
            onClick={onClick}
            className={`card ${hover ? 'card-hover cursor-pointer' : ''} ${paddings[padding]} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

// Input component with validation
export default function Input({
    label,
    type = 'text',
    error,
    className = '',
    ...props
}) {
    return (
        <div className={className}>
            {label && <label className="label">{label}</label>}
            <input
                type={type}
                className={`input ${error ? 'input-error' : ''}`}
                {...props}
            />
            {error && <p className="error-text">{error}</p>}
        </div>
    );
}

// Textarea component
export function Textarea({
    label,
    error,
    rows = 4,
    className = '',
    ...props
}) {
    return (
        <div className={className}>
            {label && <label className="label">{label}</label>}
            <textarea
                rows={rows}
                className={`input resize-none ${error ? 'input-error' : ''}`}
                {...props}
            />
            {error && <p className="error-text">{error}</p>}
        </div>
    );
}

// Select component
export function Select({
    label,
    options = [],
    error,
    className = '',
    ...props
}) {
    return (
        <div className={className}>
            {label && <label className="label">{label}</label>}
            <select
                className={`input ${error ? 'input-error' : ''}`}
                {...props}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="error-text">{error}</p>}
        </div>
    );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    rightElement?: React.ReactNode;
}

export default function Input({
    label,
    error,
    helperText,
    rightElement,
    id,
    className = "",
    ...props
}: InputProps) {
    return (
        <div className="space-y-2">
            {label && (
                <div className="flex justify-between items-center ml-1">
                    <label className="block text-sm font-headline font-bold text-on-surface" htmlFor={id}>
                        {label}
                    </label>
                    {rightElement}
                </div>
            )}
            <input
                id={id}
                className={`w-full px-6 py-4 bg-surface-container-low border-none rounded-xl font-body text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface transition-all outline-none ${error ? "focus:ring-error" : ""
                    } ${className}`}
                {...props}
            />
            {error && <p className="text-sm text-error ml-1">{error}</p>}
            {helperText && <p className="text-xs text-secondary ml-1">{helperText}</p>}
        </div>
    );
}

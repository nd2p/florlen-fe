import * as React from "react";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Checkbox({ className = "", ...props }: CheckboxProps) {
    return (
        <input
            type="checkbox"
            className={`peer sr-only ${className}`}
            {...props}
        />
    );
}
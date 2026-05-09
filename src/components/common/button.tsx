import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "social";
    size?: "sm" | "md" | "lg";
}

export default function Button({
    children,
    variant = "primary",
    size = "md",
    className = "",
    ...props
}: ButtonProps) {
    const baseStyles = "font-headline font-bold transition-all active:scale-95 duration-200 rounded-xl";

    const variantStyles = {
        primary: "bg-primary hover:bg-primary-container text-on-primary shadow-[0_10px_20px_-5px_rgba(164,0,21,0.3)]",
        secondary: "bg-surface-container-highest hover:bg-surface-variant text-on-surface",
        social: "bg-surface-container-highest hover:bg-surface-variant text-on-surface flex items-center justify-center gap-3",
    };

    const sizeStyles = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-4 text-base",
        lg: "px-8 py-5 text-lg w-full rounded-full",
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
    variant?: "default" | "secondary" | "outline";
};

export default function Badge({ className, children, variant = "default", ...props }: BadgeProps) {
    const base = "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm";

    const variantClasses: Record<string, string> = {
        default: "bg-on-background text-surface",
        secondary: "bg-tertiary-container text-on-tertiary",
        outline: "bg-transparent border border-outline text-on-surface",
    };

    return (
        <span {...props} className={cn(base, variantClasses[variant] || variantClasses.default, className)}>
            {children}
        </span>
    );
}

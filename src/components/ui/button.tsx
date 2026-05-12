import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap font-headline font-bold transition-all duration-200 rounded-xl active:scale-95 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary hover:bg-primary-container text-on-primary shadow-[0_10px_20px_-5px_rgba(164,0,21,0.3)]",
        secondary:
          "bg-surface-container-highest hover:bg-surface-variant text-on-surface",
        social:
          "bg-surface-container-highest hover:bg-surface-variant text-on-surface flex items-center justify-center gap-3",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-4 text-base",
        lg: "px-8 py-5 text-lg w-full rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

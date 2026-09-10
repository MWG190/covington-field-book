import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] text-sm font-medium transition-[opacity,transform,background-color] duration-150 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] min-h-11 px-3.5",
  {
    variants: {
      variant: {
        default: "bg-river text-river-fg hover:opacity-90",
        ink: "bg-ink text-paper hover:opacity-90",
        outline:
          "border border-line-strong bg-panel text-ink hover:bg-paper-2",
        ghost: "text-ink-soft hover:bg-paper-2",
        danger: "bg-danger text-paper hover:opacity-90",
      },
      size: {
        default: "h-11",
        sm: "h-9 min-h-9 px-3 text-[13px]",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

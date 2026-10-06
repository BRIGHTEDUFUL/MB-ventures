import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-ink text-white",
        secondary: "border-line bg-canvas text-ink",
        accent: "border-accent/20 bg-accent-soft text-accent font-semibold",
        sale: "border-accent/20 bg-accent-soft text-accent font-semibold",
        destructive: "border-danger/20 bg-danger-soft text-danger",
        warning: "border-warning/20 bg-warning-soft text-warning",
        success: "border-success/20 bg-success-soft text-success",
        outline: "border-line bg-transparent text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

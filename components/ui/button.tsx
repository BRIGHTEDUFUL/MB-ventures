import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-120 ease-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white hover:bg-brand-hover active:bg-brand-active",
        default: "bg-brand text-white hover:bg-brand-hover active:bg-brand-active",
        secondary:
          "border border-line-strong bg-surface text-ink hover:bg-canvas active:bg-canvas-strong",
        outline:
          "border border-line-strong bg-transparent text-ink hover:bg-canvas active:bg-canvas-strong",
        tertiary:
          "bg-transparent text-ink hover:text-brand hover:underline p-0 h-auto font-medium shadow-none",
        link: "bg-transparent text-brand hover:underline p-0 h-auto font-medium shadow-none",
        accent: "bg-accent text-white hover:bg-accent-hover active:bg-accent-hover",
        destructive: "bg-danger text-white hover:bg-danger-hover active:bg-danger-hover",
        ghost: "bg-transparent text-ink hover:bg-canvas active:bg-canvas-strong",
        dark: "bg-brand text-white hover:bg-brand-hover active:bg-brand-active",
      },
      size: {
        default: "h-11 min-h-[44px] px-4 py-2",
        md: "h-11 min-h-[44px] px-4 py-2",
        sm: "h-11 min-h-[44px] px-3 text-xs",
        lg: "h-[52px] min-h-[52px] px-6 text-base font-semibold",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px] p-0",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-current" />
            {loadingText ?? children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

import * as React from "react";
import { cn } from "@/lib/utils";
import { FOCUS_RING } from "@/lib/focus";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          `flex h-11 min-h-[44px] w-full rounded-md border border-line-strong bg-surface px-3.5 py-2 text-sm text-ink ring-offset-surface file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-ink-subtle transition-all duration-200 ${FOCUS_RING} focus-visible:border-brand focus-visible:scale-[1.01] disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-muted`,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

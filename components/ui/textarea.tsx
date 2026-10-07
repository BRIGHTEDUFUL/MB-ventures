import * as React from "react";
import { cn } from "@/lib/utils";
import { FOCUS_RING } from "@/lib/focus";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          `flex min-h-[100px] w-full rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink ring-offset-surface placeholder:text-ink-subtle transition-all duration-200 ${FOCUS_RING} focus-visible:border-brand focus-visible:scale-[1.01] disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-muted`,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

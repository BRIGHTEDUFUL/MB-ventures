import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "main" | "article" | "aside" | "header" | "footer";
  size?: "default" | "narrow" | "wide";
}

/**
 * Responsive container with mobile-first gutters.
 * - Mobile: 16px gutters (--gutter)
 * - Tablet 640px+: 24px gutters
 * - Desktop 1024px+: 32px gutters
 * - Max-width: 1280px (default) | 768px (narrow) | full (wide)
 *
 * Uses CSS custom property --gutter for consistent spacing across all breakpoints.
 */
export function Container({
  as: Tag = "div",
  size = "default",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "w-full mx-auto px-[var(--gutter)]",
        size === "default" && "max-w-[1280px]",
        size === "narrow" && "max-w-3xl",
        size === "wide" && "max-w-none",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

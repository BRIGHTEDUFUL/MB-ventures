import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "mark" | "text";
  className?: string;
  href?: string;
}

const sizeClasses = {
  sm: "h-8", // 32px for header
  md: "h-12", // 48px for footer
  lg: "h-16", // 64px for special pages
};

/**
 * MB Ventures GH Logo Component
 * Professional logo integration with multiple size and variant options
 */
export function Logo({
  size = "md",
  variant = "full",
  className,
  href = "/",
}: LogoProps) {
  const heightClass = sizeClasses[size];

  // Logo with full branding (image + text fallback)
  if (variant === "full") {
    const content = (
      <div className={cn("flex items-center gap-2.5 group", className)}>
        {/* Logo Image - will use public/mb-ventures-logo.png when available */}
        <div className={cn("relative transition-transform duration-200 group-hover:scale-105", heightClass)}>
          <Image
            src="/mb-ventures-logo.png"
            alt="MB Ventures GH"
            width={200}
            height={64}
            className={cn("w-auto object-contain", heightClass)}
            priority
            unoptimized
          />
        </div>
      </div>
    );

    if (href) {
      return (
        <Link
          href={href}
          className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-sm"
          aria-label="MB Ventures GH Home"
        >
          {content}
        </Link>
      );
    }

    return content;
  }

  // Logo mark only (compact version for mobile/tight spaces)
  if (variant === "mark") {
    const content = (
      <div
        className={cn(
          "flex items-center justify-center font-heading font-bold text-ink transition-transform duration-200 group-hover:scale-105",
          size === "sm" && "w-8 h-8 text-sm",
          size === "md" && "w-10 h-10 text-base",
          size === "lg" && "w-12 h-12 text-lg",
          className
        )}
      >
        <span className="bg-gradient-to-br from-brand to-accent bg-clip-text text-transparent">
          MB
        </span>
      </div>
    );

    if (href) {
      return (
        <Link
          href={href}
          className="inline-flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-sm"
          aria-label="MB Ventures GH Home"
        >
          {content}
        </Link>
      );
    }

    return content;
  }

  // Text only version
  const content = (
    <div className={cn("flex flex-col leading-none group", className)}>
      <span
        className={cn(
          "font-heading font-bold tracking-tight transition-colors duration-200 group-hover:text-brand",
          size === "sm" && "text-lg",
          size === "md" && "text-xl",
          size === "lg" && "text-2xl"
        )}
      >
        <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
          MB Ventures
        </span>
      </span>
      <span
        className={cn(
          "font-heading font-semibold text-accent uppercase tracking-wider",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-base"
        )}
      >
        GH
      </span>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 rounded-sm"
        aria-label="MB Ventures GH Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}

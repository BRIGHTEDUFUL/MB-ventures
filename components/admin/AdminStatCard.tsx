import React from "react";
import Link from "next/link";
import { type LucideIcon, ArrowUpRight } from "lucide-react";

interface AdminStatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: LucideIcon;
  href?: string;
  variant?: "default" | "alert" | "warning" | "success";
}

export function AdminStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  variant = "default",
}: AdminStatCardProps) {
  const CardWrapper = href ? Link : "div";

  const getVariantStyles = () => {
    switch (variant) {
      case "alert":
      case "warning":
        return "border-warning/60 bg-warning-soft/40 hover:border-warning";
      case "success":
        return "border-success/40 bg-success-soft/30 hover:border-success";
      default:
        return "border-line bg-surface hover:border-line-strong";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case "alert":
      case "warning":
        return "text-warning bg-warning-soft";
      case "success":
        return "text-success bg-success-soft";
      default:
        return "text-ink-muted bg-canvas";
    }
  };

  return (
    <CardWrapper
      href={href as string}
      className={`block p-5 rounded-lg border transition-colors relative group ${getVariantStyles()}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-mono font-medium text-ink-muted uppercase tracking-wider block">
            {title}
          </span>
          <div className="font-heading font-bold text-2xl sm:text-3xl text-ink mt-2 tracking-tight">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-ink-muted mt-1.5 flex items-center gap-1">{subtitle}</p>
          )}
        </div>

        <div
          className={`w-10 h-10 rounded-md border border-line flex items-center justify-center shrink-0 ${getIconStyles()}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {href && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-ink-muted">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      )}
    </CardWrapper>
  );
}

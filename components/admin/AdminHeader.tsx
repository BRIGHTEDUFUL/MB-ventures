import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function AdminHeader({ title, description, breadcrumbs, actions }: AdminHeaderProps) {
  return (
    <div className="border-b border-line pb-5 mb-6 space-y-2">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Admin Breadcrumbs"
          className="flex items-center gap-1.5 text-xs text-ink-muted font-mono mb-2"
        >
          <Link href="/admin" className="hover:text-ink transition-colors">
            Admin
          </Link>
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              <ChevronRight className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
              {b.href ? (
                <Link href={b.href} className="hover:text-ink transition-colors">
                  {b.label}
                </Link>
              ) : (
                <span className="text-ink font-medium">{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink tracking-tight">
            {title}
          </h1>
          {description && <p className="text-xs sm:text-sm text-ink-muted mt-1">{description}</p>}
        </div>

        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

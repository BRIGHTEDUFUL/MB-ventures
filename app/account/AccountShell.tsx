"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { Package, User, MapPin, LogOut, ChevronRight, ShoppingBag } from "lucide-react";

const NAV_LINKS = [
  { href: "/account", label: "Overview", icon: ShoppingBag, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useAuthActions();
  const { user } = useCurrentUser();

  return (
    <div className="bg-canvas min-h-[100dvh]">
      <div className="max-w-[1280px] mx-auto px-[var(--gutter)] py-8 lg:py-12">
        {/* Page header */}
        <div className="mb-8">
          <p className="text-sm text-ink-muted mb-1">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <ChevronRight className="inline w-3.5 h-3.5 mx-1" />
            Account
          </p>
          <h1
            className="font-heading font-bold text-ink"
            style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}
          >
            My account
          </h1>
          {user?.email && (
            <p className="text-ink-muted mt-1">
              Signed in as <span className="text-ink font-medium">{user.email}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 items-start">
          {/* Sidebar navigation */}
          <nav aria-label="Account navigation">
            <ul className="space-y-0.5">
              {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
                const isActive = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={[
                        "flex min-h-[44px] items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                        isActive ? "bg-brand text-white" : "text-ink hover:bg-canvas",
                      ].join(" ")}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <button
                  onClick={() => signOut()}
                  className="flex w-full min-h-[44px] items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-ink-muted hover:bg-canvas-strong hover:text-danger transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Sign out
                </button>
              </li>
            </ul>
          </nav>

          {/* Main content */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

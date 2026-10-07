"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Truck,
  Settings,
  Store,
  LogOut,
  Menu,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: Package,
    hasBadge: true,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: ShoppingBag,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Layers,
  },
  {
    label: "Delivery & Pickup",
    href: "/admin/delivery",
    icon: Truck,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const { signOut } = useAuthActions();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Live order stats for badge count
  const stats = useQuery(
    api.adminOrders.getDashboardStats,
    !isLoading && isAuthenticated && user?.role === "admin" ? {} : "skip"
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-line-strong border-t-ink rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-ink-muted">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border border-line rounded-lg p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-canvas border border-line flex items-center justify-center mx-auto text-ink">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-heading font-bold text-xl text-ink">Admin Authentication Required</h1>
          <p className="text-sm text-ink-muted">
            Please sign in with an administrative account to access this console.
          </p>
          <Link
            href="/sign-in?redirectTo=/admin"
            className="inline-flex items-center justify-center w-full h-11 rounded-md bg-brand text-white font-semibold text-sm hover:bg-brand-hover transition-colors"
          >
            Sign In to Admin
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border border-danger/40 rounded-lg p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-danger-soft border border-danger/30 flex items-center justify-center mx-auto text-danger">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="font-heading font-bold text-xl text-ink">Access Denied (403 Forbidden)</h1>
          <p className="text-sm text-ink-muted">
            Your account (<strong className="text-ink font-medium">{user.email}</strong>) does not
            have administrative privileges.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full h-11 rounded-md border border-line bg-surface hover:bg-canvas text-ink text-xs font-semibold transition-colors"
            >
              Return to Storefront
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex items-center justify-center w-full h-11 rounded-md text-danger text-xs font-semibold hover:bg-danger-soft transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingMoMoCount = stats?.pendingVerificationCount ?? 0;

  return (
    <div className="min-h-screen bg-canvas flex flex-col lg:flex-row">
      {/* Desktop Sidebar (Left 260px) */}
      <aside className="hidden lg:flex w-64 bg-surface border-r border-line flex-col justify-between shrink-0 h-screen sticky top-0 z-30">
        <div>
          {/* Admin Header / Logo */}
          <div className="h-16 px-6 border-b border-line flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="w-7 h-7 bg-ink text-surface rounded flex items-center justify-center text-xs font-mono font-bold shrink-0">
                MB
              </span>
              <div>
                <span className="font-heading font-bold text-sm text-ink block leading-tight">
                  MB Ventures
                </span>
                <span className="text-[10px] font-mono text-ink-muted block uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-brand text-white font-semibold"
                      : "text-ink-muted hover:text-ink hover:bg-canvas"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon
                      className={`w-4 h-4 ${isActive ? "text-surface" : "text-ink-muted"}`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.hasBadge && pendingMoMoCount > 0 && (
                    <span
                      className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono font-bold flex items-center justify-center ${
                        isActive ? "bg-accent text-surface" : "bg-accent-soft text-accent"
                      }`}
                    >
                      {pendingMoMoCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer: User Info & Storefront Link */}
        <div className="p-3 border-t border-line space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-md border border-line bg-canvas hover:bg-canvas-strong text-xs font-medium text-ink transition-colors"
          >
            <div className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-ink-muted" />
              <span>View Storefront</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-ink-subtle" />
          </Link>

          <div className="p-2.5 bg-canvas rounded-md border border-line flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold text-ink truncate leading-tight">
                {user.name || "Admin"}
              </p>
              <p className="text-[11px] text-ink-muted truncate font-mono">{user.email}</p>
            </div>

            <button
              type="button"
              onClick={() => signOut()}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 text-ink-muted hover:text-danger rounded hover:bg-surface transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden h-14 bg-surface border-b border-line px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open Admin Menu"
            className="p-2 -ml-2 text-ink hover:text-ink-muted rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-heading font-bold text-sm text-ink">MB Ventures Admin</span>
        </div>

        {pendingMoMoCount > 0 && (
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent-soft text-accent text-xs font-mono font-semibold"
          >
            <span>MoMo Action:</span>
            <span>{pendingMoMoCount}</span>
          </Link>
        )}
      </div>

      {/* Mobile Drawer */}
      <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <SheetContent
          side="left"
          className="w-72 p-0 flex flex-col bg-surface border-r border-line"
        >
          <SheetHeader className="px-5 py-4 border-b border-line text-left">
            <SheetTitle className="font-heading text-base font-bold text-ink">
              Admin Menu
            </SheetTitle>
          </SheetHeader>

          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-brand text-white font-semibold"
                      : "text-ink-muted hover:text-ink hover:bg-canvas"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon
                      className={`w-4 h-4 ${isActive ? "text-surface" : "text-ink-muted"}`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.hasBadge && pendingMoMoCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono font-bold bg-accent-soft text-accent flex items-center justify-center">
                      {pendingMoMoCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-line space-y-2">
            <Link
              href="/"
              target="_blank"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-md border border-line bg-canvas text-xs font-medium text-ink"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileDrawerOpen(false);
                signOut();
              }}
              className="w-full h-11 rounded-md text-danger text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-danger-soft"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Admin Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

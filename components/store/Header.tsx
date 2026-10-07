"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useAuthActions } from "@convex-dev/auth/react";
import { Search, ShoppingBag, User, Menu, ShieldCheck, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuickSearchDialog } from "./QuickSearchDialog";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { CartDrawer } from "./CartDrawer";
import { useCart } from "@/lib/cart/CartContext";

interface HeaderProps {
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
  shopName: string;
  supportPhone: string;
  whatsappNumber: string;
  cartCount?: number;
}

export function Header({ categories, shopName, supportPhone, whatsappNumber }: HeaderProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const { signOut } = useAuthActions();
  const { itemCount, openDrawer } = useCart();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface border-b border-line transition-shadow duration-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger + Brand logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 text-ink hover:text-ink-muted rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              href="/"
              className="flex items-center gap-2 text-ink font-heading font-bold text-lg sm:text-xl tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm py-1"
            >
              <span className="w-7 h-7 bg-ink text-surface rounded flex items-center justify-center text-xs font-mono font-bold shrink-0">
                MB
              </span>
              <span className="truncate">{shopName || "MB Ventures GH"}</span>
            </Link>
          </div>

          {/* Center: Desktop category navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/catalog"
              className={`py-2 transition-colors relative hover:text-ink ${
                pathname === "/catalog"
                  ? "text-ink font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-ink"
                  : "text-ink-muted"
              }`}
            >
              All Products
            </Link>
            {categories.slice(0, 4).map((cat) => {
              const isActive = pathname === `/category/${cat.slug}`;
              return (
                <Link
                  key={cat._id}
                  href={`/category/${cat.slug}`}
                  className={`py-2 transition-colors relative hover:text-ink ${
                    isActive
                      ? "text-ink font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-ink"
                      : "text-ink-muted"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search button, User account, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search Trigger Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-line hover:border-line-strong bg-canvas hover:bg-canvas-strong text-ink-muted text-xs font-normal transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <Search className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only pr-1 text-ink-muted">Search products...</span>
            </button>
            <kbd className="hidden md:inline-block font-mono text-[10px] bg-surface text-ink-subtle border border-line px-1.5 py-0.5 rounded pointer-events-none select-none">
              ⌘K
            </kbd>

            {/* User Account Menu / Sign In */}
            {!isLoading && isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="User account menu"
                    className="flex items-center gap-1.5 p-1.5 rounded-md hover:bg-canvas text-ink transition-colors min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <div className="w-7 h-7 rounded-full bg-canvas-strong border border-line flex items-center justify-center text-xs font-semibold text-ink">
                      {user.name ? (
                        user.name.slice(0, 2).toUpperCase()
                      ) : (
                        <User className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-ink-muted hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 bg-surface border-line shadow-layer"
                >
                  <DropdownMenuLabel className="font-normal text-xs text-ink-muted">
                    Signed in as{" "}
                    <strong className="text-ink font-medium block truncate">
                      {user.email || user.name}
                    </strong>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-line" />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2 text-ink-muted" />
                      <span>My Account & Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <ShieldCheck className="w-4 h-4 mr-2 text-link" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-line" />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer text-danger focus:text-danger focus:bg-danger/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/sign-in"
                aria-label="Sign In"
                className="hidden sm:inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-md border border-line hover:border-line-strong hover:bg-canvas text-ink transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Sign In
              </Link>
            )}

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label={`Shopping cart with ${itemCount} items`}
              className="relative p-2 rounded-md hover:bg-canvas text-ink transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <ShoppingBag className="w-5 h-5 text-ink" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-brand text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Quick Search Dialog */}
      <QuickSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        open={mobileDrawerOpen}
        onOpenChange={setMobileDrawerOpen}
        categories={categories}
        supportPhone={supportPhone}
        whatsappNumber={whatsappNumber}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />
    </>
  );
}

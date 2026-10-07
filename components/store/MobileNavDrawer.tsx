"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  Armchair,
  Layers,
  Keyboard,
  Monitor,
  HardDrive,
  User,
  LogOut,
  Phone,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

interface MobileNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
  supportPhone: string;
  whatsappNumber: string;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "ergonomic-chairs": Armchair,
  "standing-desks": Layers,
  "keyboards-and-mice": Keyboard,
  "monitors-and-docks": Monitor,
  "hardware-and-storage": HardDrive,
};

export function MobileNavDrawer({
  open,
  onOpenChange,
  categories,
  supportPhone,
  whatsappNumber,
}: MobileNavDrawerProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useCurrentUser();
  const { signOut } = useAuthActions();

  const handleLinkClick = () => {
    onOpenChange(false);
  };

  const handleSignOut = async () => {
    onOpenChange(false);
    await signOut();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[85vw] max-w-sm p-0 flex flex-col bg-surface border-line text-ink"
      >
        <SheetHeader className="p-4 border-b border-line text-left">
          <SheetTitle className="text-base font-bold font-heading text-ink flex items-center gap-2">
            <span className="w-6 h-6 bg-ink text-surface rounded flex items-center justify-center text-xs font-mono font-bold">
              MB
            </span>
            <span>MB VENTURES GH</span>
          </SheetTitle>
          <p className="text-xs text-ink-muted">Computer hardware & office ergonomics</p>
        </SheetHeader>

        {/* Scrollable category list */}
        <div className="flex-1 overflow-y-auto px-2 py-3 divide-y divide-line">
          {/* Main navigation */}
          <div className="space-y-1 pb-3">
            <Link
              href="/catalog"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-3 py-3 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
                pathname === "/catalog"
                  ? "bg-canvas font-semibold text-ink"
                  : "text-ink hover:bg-canvas"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-ink-muted" />
                <span>All Products</span>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-subtle" />
            </Link>

            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] || ShoppingBag;
              const isActive = pathname === `/category/${cat.slug}`;
              return (
                <Link
                  key={cat._id}
                  href={`/category/${cat.slug}`}
                  onClick={handleLinkClick}
                  className={`flex items-center justify-between px-3 py-3 rounded-md text-sm transition-colors min-h-[44px] ${
                    isActive
                      ? "bg-canvas font-semibold text-ink"
                      : "text-ink hover:bg-canvas"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-ink-muted" />
                    <span>{cat.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-subtle" />
                </Link>
              );
            })}
          </div>

          {/* Customer Account area */}
          <div className="py-3 space-y-1">
            <p className="px-3 text-[11px] font-mono uppercase tracking-wider text-ink-subtle mb-1">
              Account
            </p>
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/account"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-sm text-ink hover:bg-canvas min-h-[44px]"
                >
                  <User className="w-4 h-4 text-ink-muted" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{user.name || user.email}</p>
                    <p className="text-xs text-ink-muted">View orders & profile</p>
                  </div>
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-sm text-ink hover:bg-canvas min-h-[44px]"
                  >
                    <ShieldCheck className="w-4 h-4 text-link" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm text-danger hover:bg-canvas min-h-[44px] text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="px-3 py-2 space-y-2">
                <Link
                  href="/sign-in"
                  onClick={handleLinkClick}
                  className="w-full flex items-center justify-center h-11 px-4 rounded-md bg-ink text-surface text-sm font-semibold hover:bg-ink/90 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={handleLinkClick}
                  className="w-full flex items-center justify-center h-11 px-4 rounded-md border border-line-strong text-ink text-sm font-semibold hover:bg-canvas transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Quick contact */}
          <div className="py-3 space-y-2">
            <p className="px-3 text-[11px] font-mono uppercase tracking-wider text-ink-subtle mb-1">
              Store Support
            </p>
            <a
              href={`tel:${supportPhone.replace(/\s+/g, "")}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-xs text-ink hover:bg-canvas min-h-[44px]"
            >
              <Phone className="w-4 h-4 text-ink-muted" />
              <span>{supportPhone}</span>
            </a>
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-xs text-ink hover:bg-canvas min-h-[44px]"
            >
              <MessageSquare className="w-4 h-4 text-success" />
              <span>WhatsApp Live Chat</span>
            </a>
          </div>
        </div>

        {/* Bottom footer tag */}
        <div className="p-4 border-t border-line bg-canvas text-xs text-ink-muted flex items-center justify-between">
          <span>Accra, Ghana</span>
          <span className="font-mono text-[11px]">GHS (GH₵)</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}

import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";

interface FooterProps {
  shopName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  address: string;
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
}

export function Footer({
  shopName,
  tagline,
  supportEmail,
  supportPhone,
  whatsappNumber,
  address,
  categories,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-canvas border-t border-line text-ink mt-auto">
      {/* Service Facts Strip */}
      <div className="border-b border-line bg-surface">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-ink-muted shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-ink">Fast delivery in Accra</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  Same-day or next-day delivery. Nationwide parcel service across Ghana.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-ink-muted shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-ink">In-store pickup</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  Order online and pick up at our Circle shop with zero pickup fees.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-ink-muted shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-ink">Official store warranty</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  Genuine hardware & ergonomic furniture with genuine distributor warranty.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-ink-muted shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-ink">Direct MoMo & COD</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  Pay with MTN MoMo, Telecel Cash, Cash on Delivery or pay in store.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-ink font-heading font-bold text-lg tracking-tight"
            >
              <span className="w-7 h-7 bg-ink text-surface rounded flex items-center justify-center text-xs font-mono font-bold shrink-0">
                MB
              </span>
              <span>{shopName || "MB Ventures GH"}</span>
            </Link>
            <p className="text-xs text-ink-muted leading-relaxed max-w-sm">
              {tagline ||
                "Specialist supplier of ergonomic workspace seating, motorized standing desks, mechanical peripherals, and high-performance computing hardware in Accra, Ghana."}
            </p>

            <div className="space-y-2 pt-2 text-xs text-ink-muted">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-ink-subtle shrink-0" />
                <span>{address || "Circle Commercial Area, Accra, Ghana"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-ink-subtle shrink-0" />
                <a href={`tel:${supportPhone.replace(/\s+/g, "")}`} className="hover:text-ink">
                  {supportPhone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-ink-subtle shrink-0" />
                <a href={`mailto:${supportEmail}`} className="hover:text-ink">
                  {supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-ink-subtle shrink-0" />
                <span>Mon - Sat: 8:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink font-mono">
              Categories
            </p>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li>
                <Link href="/catalog" className="hover:text-ink transition-colors">
                  All Products
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat._id}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-ink transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink font-mono">
              Help & Support
            </p>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-success" />
                  <span>WhatsApp Support</span>
                </a>
              </li>
              <li>
                <Link href="/account" className="hover:text-ink transition-colors">
                  Order Status & Tracking
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-ink transition-colors">
                  Delivery Zones & Rates
                </Link>
              </li>
              <li>
                <Link href="/pickup" className="hover:text-ink transition-colors">
                  Store Pickup Info
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="hover:text-ink transition-colors">
                  Warranty & Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Accepted Payments */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink font-mono">
              Accepted Payments
            </p>
            <p className="text-xs text-ink-muted leading-relaxed">
              We accept manual Mobile Money, Cash on Delivery, or payment at the store counter:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-1 bg-surface border border-line rounded text-[11px] font-mono text-ink">
                MTN MoMo
              </span>
              <span className="px-2 py-1 bg-surface border border-line rounded text-[11px] font-mono text-ink">
                Telecel Cash
              </span>
              <span className="px-2 py-1 bg-surface border border-line rounded text-[11px] font-mono text-ink">
                AirtelTigo
              </span>
              <span className="px-2 py-1 bg-surface border border-line rounded text-[11px] font-mono text-ink">
                Cash on Delivery
              </span>
              <span className="px-2 py-1 bg-surface border border-line rounded text-[11px] font-mono text-ink">
                Pay in Store
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-footer bottom bar */}
      <div className="border-t border-line bg-surface py-4">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-muted">
          <p>
            © {currentYear} {shopName || "MB Ventures GH"}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/terms" className="hover:text-ink">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-ink">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

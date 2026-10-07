import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Container } from "@/components/shared/Container";
import { ContactForm } from "@/components/store/ContactForm";
import { Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Reach the shop about an order, delivery, pickup, or a product by email, phone, WhatsApp, or the contact form.",
};

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

interface ShopDetail {
  label: string;
  value: string;
  href?: string;
  icon: LucideIcon;
}

export default async function ContactPage() {
  const [settings, pickupLocations] = await Promise.all([
    fetchQuery(api.siteSettings.getPublicSettings, {}).catch(() => null),
    fetchQuery(api.fulfillment.listPickupLocations, {}).catch(() => []),
  ]);

  const details: ShopDetail[] = [];
  if (settings) {
    const whatsappDigits = settings.whatsappNumber.replace(/[^0-9]/g, "");
    details.push(
      {
        label: "Email",
        value: settings.contactEmail,
        href: `mailto:${settings.contactEmail}`,
        icon: Mail,
      },
      {
        label: "Phone",
        value: settings.contactPhone,
        href: `tel:${settings.contactPhone.replace(/[^0-9+]/g, "")}`,
        icon: Phone,
      },
      {
        label: "WhatsApp",
        value: settings.whatsappNumber,
        href: settings.socialLinks.whatsapp || `https://wa.me/${whatsappDigits}`,
        icon: MessageCircle,
      },
      { label: "Address", value: settings.address, icon: MapPin }
    );
  }

  return (
    <div className="py-8 sm:py-12">
      <Container>
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-mono uppercase tracking-[0.06em] text-ink-subtle block mb-2">
            Contact
          </span>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink tracking-tight mb-3">
            Contact us
          </h1>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            Questions about an order, delivery, pickup, or a product? Send us a message using the
            form, or reach the shop directly using the details below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Shop details and opening hours */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface border border-line rounded-lg p-5 sm:p-6">
              <h2 className="font-heading font-bold text-base text-ink border-b border-line pb-3 mb-1">
                Shop details
              </h2>
              <ul className="divide-y divide-line">
                {details.length === 0 && (
                  <li className="py-3 text-sm text-ink-muted">
                    Shop details are unavailable right now. Please try again later.
                  </li>
                )}
                {details.map((detail) => {
                  const Icon = detail.icon;
                  const isExternal = detail.href?.startsWith("http") ?? false;
                  const row = (
                    <>
                      <Icon
                        className="w-4 h-4 shrink-0 mt-1 text-ink-muted"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block text-xs text-ink-muted">{detail.label}</span>
                        <span
                          className={`block text-sm font-medium break-words mt-0.5 group-hover:underline ${
                            detail.href ? "text-link" : "text-ink"
                          }`}
                        >
                          {detail.value}
                        </span>
                      </span>
                    </>
                  );

                  return (
                    <li key={detail.label} className="py-2 first:pt-0 last:pb-0">
                      {detail.href ? (
                        <a
                          href={detail.href}
                          className={`group flex items-start gap-3 min-h-11 py-2 rounded-md transition-colors ${FOCUS_RING}`}
                          target={isExternal ? "_blank" : undefined}
                          rel={isExternal ? "noopener noreferrer" : undefined}
                        >
                          {row}
                        </a>
                      ) : (
                        <div className="flex items-start gap-3 py-2">{row}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-surface border border-line rounded-lg p-5 sm:p-6">
              <h2 className="font-heading font-bold text-base text-ink border-b border-line pb-3 mb-1">
                Opening hours
              </h2>
              {pickupLocations.length === 0 ? (
                <p className="text-sm text-ink-muted py-3">
                  Opening hours are not listed yet. Contact us by email, phone, or WhatsApp.
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {pickupLocations.map((location) => (
                    <li key={location._id} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-sm font-semibold text-ink">{location.name}</p>
                      <p className="text-sm text-ink-muted mt-0.5">{location.address}</p>
                      <p className="text-xs font-mono text-ink mt-1">{location.openingHours}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-7">
            <div className="bg-surface border border-line rounded-lg p-5 sm:p-6">
              <h2 className="font-heading font-bold text-base text-ink">Send a message</h2>
              <p className="text-xs text-ink-muted mt-1 mb-5">Fields marked with * are required.</p>
              <ContactForm />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Container } from "@/components/shared/Container";
import { ProductCard } from "@/components/store/ProductCard";
import { FOCUS_RING } from "@/lib/focus";
import {
  Armchair,
  Layers,
  Keyboard,
  Monitor,
  HardDrive,
  ArrowRight,
  Truck,
  Store,
  ShieldCheck,
  Check,
  type LucideIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_META: Record<string, { icon: LucideIcon; subtitle: string }> = {
  "ergonomic-chairs": {
    icon: Armchair,
    subtitle: "Mesh & executive seating",
  },
  "standing-desks": {
    icon: Layers,
    subtitle: "Dual-motor motorized workstations",
  },
  "keyboards-and-mice": {
    icon: Keyboard,
    subtitle: "Mechanical & wireless peripherals",
  },
  "monitors-and-docks": {
    icon: Monitor,
    subtitle: "Thunderbolt 4 & USB-C hubs",
  },
  "hardware-and-storage": {
    icon: HardDrive,
    subtitle: "NVMe SSDs & components",
  },
};

const FULFILMENT_POINTS: Array<{
  icon: LucideIcon;
  title: string;
  body: string;
}> = [
  {
    icon: Truck,
    title: "Doorstep delivery",
    body: "Scheduled dispatch with trusted couriers. Same day within Accra Central and 24 to 48 hours for Greater Accra.",
  },
  {
    icon: Store,
    title: "In-store pickup",
    body: "Reserve online and test chairs, desks, or peripherals at our Circle retail store before taking them home.",
  },
  {
    icon: ShieldCheck,
    title: "Direct Mobile Money",
    body: "Fast manual payment via MTN MoMo, Telecel Cash, or Cash on Delivery. Transparent verification by our team.",
  },
];

export default async function HomePage() {
  const [featuredProducts, categories, settings] = await Promise.all([
    fetchQuery(api.products.listFeatured, { limit: 8 }).catch(() => []),
    fetchQuery(api.categories.list, { parentId: null }).catch(() => []),
    fetchQuery(api.siteSettings.getPublicSettings, {}).catch(() => null),
  ]);

  const hero = settings?.hero || {
    title: "Computer accessories, hardware, and ergonomic workspace furniture.",
    subtitle:
      "Specialist equipment for productive setups. High performance hardware, mechanical keyboards, ergonomic seating, and motorized standing desks in stock for immediate delivery or pickup in Accra.",
    buttonText: "Shop workspace gear",
    buttonLink: "/catalog",
    imageUrl: null as string | null,
  };

  const heroImageUrl = hero.imageUrl || null;

  return (
    <div className="pb-12 sm:pb-16">
      {/* Hero */}
      <section className="bg-canvas border-b border-line py-8 sm:py-12 lg:py-16">
        <Container size="default">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className={heroImageUrl ? "lg:col-span-7" : "lg:col-span-8"}>
              <span className="text-xs font-mono uppercase tracking-[0.06em] text-ink-muted block mb-3">
                MB Ventures GH · Accra, Ghana
              </span>

              <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight leading-[1.1] mb-4">
                {hero.title}
              </h1>

              <p className="text-sm sm:text-base text-ink-muted leading-relaxed mb-7 max-w-2xl">
                {hero.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={hero.buttonLink || "/catalog"}
                  className={`inline-flex items-center justify-center gap-1.5 min-h-11 px-5 rounded-md bg-brand text-surface text-sm font-semibold hover:bg-brand-hover active:bg-brand-active transition-colors duration-120 ease-snap ${FOCUS_RING}`}
                >
                  <span>{hero.buttonText || "Shop workspace gear"}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                </Link>

                <Link
                  href="/category/ergonomic-chairs"
                  className={`inline-flex items-center justify-center min-h-11 px-5 rounded-md border border-line-strong bg-surface text-ink text-sm font-semibold hover:bg-canvas transition-colors duration-120 ease-snap ${FOCUS_RING}`}
                >
                  Office chairs
                </Link>

                <Link
                  href="/category/standing-desks"
                  className={`inline-flex items-center justify-center min-h-11 px-5 rounded-md border border-line-strong bg-surface text-ink text-sm font-semibold hover:bg-canvas transition-colors duration-120 ease-snap ${FOCUS_RING}`}
                >
                  Standing desks
                </Link>
              </div>

              <ul className="mt-8 border-t border-line pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-ink-muted">
                <li className="flex items-center gap-2">
                  <Check
                    className="w-4 h-4 text-brand shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span>Same-day delivery across Accra</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check
                    className="w-4 h-4 text-brand shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span>MTN MoMo &amp; Telecel Cash accepted</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check
                    className="w-4 h-4 text-brand shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span>In-store pickup at Circle</span>
                </li>
              </ul>
            </div>

            {heroImageUrl && (
              <div className="lg:col-span-5">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm border border-line bg-surface">
                  <Image
                    src={heroImageUrl}
                    alt={hero.title}
                    width={800}
                    height={600}
                    unoptimized
                    priority
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Categories */}
      <section className="pt-8 sm:pt-12">
        <Container size="default">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.06em] text-ink-subtle block mb-1">
                Catalog
              </span>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-ink tracking-tight">
                Shop by category
              </h2>
            </div>
            <Link
              href="/catalog"
              className={`text-sm font-medium text-link flex items-center gap-1.5 min-h-11 rounded ${FOCUS_RING}`}
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat.slug] || {
                icon: HardDrive,
                subtitle: "Specialist equipment",
              };
              const Icon = meta.icon;

              return (
                <Link
                  key={cat._id}
                  href={`/category/${cat.slug}`}
                  className={`group flex flex-col bg-surface border border-line hover:border-line-strong rounded-lg overflow-hidden transition-all duration-200 hover-lift ${FOCUS_RING}`}
                >
                  <div className="bg-canvas border-b border-line aspect-[4/3] flex items-center justify-center transition-all duration-200 group-hover:bg-gradient-to-br group-hover:from-brand-soft group-hover:to-canvas">
                    <Icon
                      className="w-6 h-6 text-ink-muted group-hover:text-brand transition-all duration-200 group-hover:scale-110"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="p-3 sm:p-4 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-heading font-semibold text-sm text-ink group-hover:text-link transition-colors duration-120 ease-snap">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-ink-muted mt-1 line-clamp-1">{meta.subtitle}</p>
                    </div>
                    <ArrowRight
                      className="w-4 h-4 shrink-0 mt-0.5 text-brand opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-120 ease-snap"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Featured products */}
      <section className="pt-8 sm:pt-14 lg:pt-16">
        <Container size="default">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.06em] text-ink-subtle block mb-1">
                In Stock &amp; Ready to Ship
              </span>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-ink tracking-tight">
                Featured hardware &amp; ergonomic gear
              </h2>
            </div>
            <Link
              href="/catalog"
              className={`text-sm font-medium text-link flex items-center gap-1.5 min-h-11 rounded ${FOCUS_RING}`}
            >
              <span>Full catalog</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      {/* Delivery, pickup and payment */}
      <section className="mt-10 sm:mt-14 bg-canvas border-t border-line py-8 sm:py-10 lg:py-12">
        <Container size="default">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4">
              <span className="text-xs font-mono uppercase tracking-[0.06em] text-ink-subtle block mb-2">
                Delivery and payment
              </span>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-ink tracking-tight">
                How orders are delivered and paid for
              </h2>
            </div>

            <ul className="md:col-span-8 border-t border-line divide-y divide-line">
              {FULFILMENT_POINTS.map((point) => {
                const Icon = point.icon;
                return (
                  <li key={point.title} className="py-4 flex items-start gap-3">
                    <Icon
                      className="w-5 h-5 text-brand shrink-0 mt-0.5"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="font-heading font-semibold text-sm text-ink">{point.title}</h3>
                      <p className="text-sm text-ink-muted mt-1 leading-relaxed">{point.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </section>
    </div>
  );
}

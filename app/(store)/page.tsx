import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Container } from "@/components/shared/Container";
import { ProductCard } from "@/components/store/ProductCard";
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
  CheckCircle2,
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
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-canvas border-b border-line py-12 sm:py-16 lg:py-20">
        <Container size="default">
          <div className="max-w-3xl">
            <span className="text-xs font-mono uppercase tracking-wider text-ink-muted block mb-3">
              MB Ventures GH · Accra, Ghana
            </span>

            <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight leading-[1.1] mb-5">
              {hero.title}
            </h1>

            <p className="text-sm sm:text-base text-ink-muted leading-relaxed mb-8 max-w-2xl">
              {hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href={hero.buttonLink || "/catalog"}
                className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-ink text-surface text-sm font-semibold hover:bg-ink/90 active:bg-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <span>{hero.buttonText || "Shop workspace gear"}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              <Link
                href="/category/ergonomic-chairs"
                className="inline-flex items-center justify-center h-12 px-5 rounded-md border border-line-strong bg-surface text-ink text-sm font-semibold hover:bg-canvas transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Office chairs
              </Link>

              <Link
                href="/category/standing-desks"
                className="inline-flex items-center justify-center h-12 px-5 rounded-md border border-line-strong bg-surface text-ink text-sm font-semibold hover:bg-canvas transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Standing desks
              </Link>
            </div>

            {/* Key trust bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-8 mt-8 border-t border-line text-xs text-ink-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ink shrink-0" />
                <span>Same-day delivery across Accra</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ink shrink-0" />
                <span>MTN MoMo & Telecel Cash accepted</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ink shrink-0" />
                <span>In-store pickup at Circle</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Categories Grid */}
      <section>
        <Container size="default">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-ink-subtle">
                Catalog
              </span>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-ink tracking-tight mt-0.5">
                Shop by category
              </h2>
            </div>
            <Link
              href="/catalog"
              className="text-xs sm:text-sm font-medium text-ink hover:text-link flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus rounded"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
                  className="group flex flex-col p-4 bg-surface border border-line hover:border-line-strong rounded-lg transition-colors duration-150"
                >
                  <div className="w-10 h-10 rounded bg-canvas flex items-center justify-center text-ink mb-3 group-hover:bg-canvas-strong transition-colors">
                    <Icon className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <h3 className="font-heading font-semibold text-sm text-ink group-hover:text-link transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-ink-muted mt-1 line-clamp-1">
                    {meta.subtitle}
                  </p>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Featured Products */}
      <section>
        <Container size="default">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-ink-subtle">
                In Stock & Ready to Ship
              </span>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-ink tracking-tight mt-0.5">
                Featured hardware & ergonomic gear
              </h2>
            </div>
            <Link
              href="/catalog"
              className="text-xs sm:text-sm font-medium text-ink hover:text-link flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus rounded"
            >
              <span>Full catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      {/* Service Highlight & Payment Methods Callout */}
      <section className="bg-canvas border-y border-line py-10">
        <Container size="default">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 p-5 bg-surface border border-line rounded-lg">
              <div className="w-10 h-10 rounded bg-canvas flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-ink" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm text-ink">Doorstep delivery</h3>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Scheduled dispatch with trusted couriers. Same day within Accra Central and 24 to 48 hours for Greater Accra.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-surface border border-line rounded-lg">
              <div className="w-10 h-10 rounded bg-canvas flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-ink" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm text-ink">In-store pickup</h3>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Reserve online and test chairs, desks, or peripherals at our Circle retail store before taking them home.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-surface border border-line rounded-lg">
              <div className="w-10 h-10 rounded bg-canvas flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-ink" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm text-ink">Direct Mobile Money</h3>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Fast manual payment via MTN MoMo, Telecel Cash, or Cash on Delivery. Transparent verification by our team.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

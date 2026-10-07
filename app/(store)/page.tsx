import { ShoppingBag, ShieldCheck, Truck, Store } from "lucide-react";
import { Container } from "@/components/shared/Container";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] bg-canvas flex flex-col items-center justify-center py-12 text-ink">
      <Container size="narrow" className="text-center">
        {/* Brand identifier */}
        <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-3">
          MB Ventures GH
        </p>

        <h1 className="font-heading font-bold tracking-tight text-ink mb-3">
          Store setup in progress
        </h1>

        <p className="text-ink-muted text-sm sm:text-base mb-8 leading-relaxed max-w-sm mx-auto">
          Computer accessories, PC hardware, and office furniture.
          Delivery across Ghana and in-store pickup available soon.
        </p>

        {/* Service strip — 2 col on mobile, 4 col on sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-line mb-6">
          {[
            { icon: Truck, label: "Delivery" },
            { icon: Store, label: "Store pickup" },
            { icon: ShieldCheck, label: "Paystack" },
            { icon: ShoppingBag, label: "Warranty" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center p-3 rounded-md bg-surface">
              <Icon className="w-5 h-5 text-ink mb-1.5 shrink-0" strokeWidth={1.5} />
              <span className="text-xs font-medium text-ink">{label}</span>
            </div>
          ))}
        </div>

        <div className="text-xs text-ink-subtle">Accra, Ghana</div>
      </Container>
    </main>
  );
}

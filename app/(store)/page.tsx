import { ShoppingBag, ShieldCheck, Truck, Store } from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-ink">
      <div className="max-w-xl w-full bg-surface rounded-lg border border-line p-8 sm:p-10 text-center">
        <p className="text-xs font-mono uppercase tracking-wider text-ink-muted mb-3">
          MB Ventures GH
        </p>

        <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-ink mb-3">
          Store setup in progress
        </h1>

        <p className="text-ink-muted text-sm sm:text-base mb-8 leading-relaxed">
          Computer accessories, PC hardware, and office furniture.
          Delivery across Ghana and in-store pickup available soon.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-line mb-6">
          <div className="flex flex-col items-center p-3 rounded-md bg-canvas">
            <Truck className="w-5 h-5 text-ink mb-1.5" strokeWidth={1.5} />
            <span className="text-xs font-medium text-ink">Delivery</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-md bg-canvas">
            <Store className="w-5 h-5 text-ink mb-1.5" strokeWidth={1.5} />
            <span className="text-xs font-medium text-ink">Store pickup</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-md bg-canvas">
            <ShieldCheck className="w-5 h-5 text-ink mb-1.5" strokeWidth={1.5} />
            <span className="text-xs font-medium text-ink">Paystack</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-md bg-canvas">
            <ShoppingBag className="w-5 h-5 text-ink mb-1.5" strokeWidth={1.5} />
            <span className="text-xs font-medium text-ink">Warranty</span>
          </div>
        </div>

        <div className="text-xs text-ink-subtle">
          Accra, Ghana
        </div>
      </div>
    </main>
  );
}

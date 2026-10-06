import Link from "next/link";
import { ShoppingBag, ShieldCheck, Truck, Store } from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-12 text-center">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-6 border border-blue-100">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          MB Ventures GH Store
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
          Online Shop <span className="text-blue-600">Coming Soon</span>
        </h1>

        <p className="text-slate-600 text-base sm:text-lg mb-8 leading-relaxed">
          We are preparing our full catalog of premium computer accessories, PC hardware,
          and ergonomic office chairs and tables.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 mb-8">
          <div className="flex flex-col items-center p-3 rounded-lg bg-slate-50">
            <Truck className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-xs font-medium text-slate-700">Fast Delivery</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-slate-50">
            <Store className="w-6 h-6 text-amber-500 mb-2" />
            <span className="text-xs font-medium text-slate-700">In-Store Pickup</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-slate-50">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
            <span className="text-xs font-medium text-slate-700">Paystack Secure</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-slate-50">
            <ShoppingBag className="w-6 h-6 text-indigo-600 mb-2" />
            <span className="text-xs font-medium text-slate-700">Warranty Support</span>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          System setup and domain scaffolding in progress.
        </div>
      </div>
    </main>
  );
}

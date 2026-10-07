import type { ReactNode } from "react";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { AnnouncementBar } from "@/components/store/AnnouncementBar";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [categories, settings] = await Promise.all([
    fetchQuery(api.categories.list, { parentId: null }).catch(() => []),
    fetchQuery(api.siteSettings.getPublicSettings, {}).catch(() => null),
  ]);

  const shopName = settings?.shopName || "MB Ventures GH";
  const tagline = settings?.tagline || "Premium Computer Accessories, Hardware & Ergonomic Office Furniture";
  const supportEmail = settings?.contactEmail || "orders@mbventuresgh.com";
  const supportPhone = settings?.contactPhone || "+233 24 000 0000";
  const whatsappNumber = settings?.whatsappNumber || "+233 24 000 0000";
  const address = settings?.address || "Circle Commercial Area, Accra, Ghana";

  return (
    <div className="flex flex-col min-h-screen bg-surface text-ink antialiased">
      {settings?.announcement && (
        <AnnouncementBar announcement={settings.announcement} />
      )}
      <Header
        categories={categories || []}
        shopName={shopName}
        supportPhone={supportPhone}
        whatsappNumber={whatsappNumber}
      />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer
        categories={categories || []}
        shopName={shopName}
        tagline={tagline}
        supportEmail={supportEmail}
        supportPhone={supportPhone}
        whatsappNumber={whatsappNumber}
        address={address}
      />
    </div>
  );
}

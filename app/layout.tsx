import type { Metadata, Viewport } from "next";
import { Archivo, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

const fontHeading = Archivo({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["600", "700"],
});

const fontSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FFFFFF",
};

export const metadata: Metadata = {
  title: {
    default: "MB Ventures GH | Computer Accessories, Hardware & Office Furniture",
    template: "%s | MB Ventures GH",
  },
  description:
    "Quality computer accessories, PC hardware, and ergonomic office furniture in Ghana. Fast delivery and convenient in-store pickup.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    siteName: "MB Ventures GH",
    locale: "en_GH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html
        lang="en"
        className={`${fontHeading.variable} ${fontSans.variable} ${fontMono.variable}`}
      >
        <body className="min-h-screen bg-surface font-sans text-ink antialiased overflow-x-hidden">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}

import type { Metadata } from "next";
import { Archivo, Public_Sans, IBM_Plex_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "MB Ventures GH | Computer Accessories, Hardware & Office Furniture",
  description:
    "Quality computer accessories, PC hardware, and ergonomic office furniture in Ghana. Fast delivery and convenient in-store pickup with secure online checkout.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontHeading.variable} ${fontSans.variable} ${fontMono.variable}`}
    >
      <body className="min-h-screen bg-surface font-sans text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

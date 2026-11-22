import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import HareketAyari from "@/components/HareketAyari";
import SwKaydi from "@/components/SwKaydi";

import "./globals.css";

/**
 * Türkçe arayüz için "latin-ext" alt kümesi zorunludur:
 * ş, ğ, İ, ı gibi harfler "latin" alt kümesinde yoktur.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Disiplin",
  description: "Kişisel görev ve alışkanlık paneli.",
  applicationName: "Disiplin",
  // iOS "Ana Ekrana Ekle" için: tarayıcı çubuğu olmadan açılsın ve ikonun
  // altında "Disiplin" yazsın. Android bu bilgiyi manifest.ts'ten alır.
  appleWebApp: {
    capable: true,
    title: "Disiplin",
    statusBarStyle: "default",
  },
  // Telefon numarasına benzeyen sayıları (tarihler, "90 / 92") bağlantıya
  // çevirmesin.
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#7B1E3A",
  width: "device-width",
  initialScale: 1,
  // Ana ekrandan açıldığında çentiğin altını da uygulama boyasın.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="bg-bg text-ink font-sans flex min-h-full flex-col">
        <HareketAyari>{children}</HareketAyari>
        <SwKaydi />
      </body>
    </html>
  );
}

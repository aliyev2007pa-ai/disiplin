import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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
};

export const viewport: Viewport = {
  themeColor: "#7B1E3A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="bg-bg text-ink font-sans flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}

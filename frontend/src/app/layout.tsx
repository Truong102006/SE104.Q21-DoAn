import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n/i18n-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gold Store - Quản lý cửa hàng vàng bạc đá quý",
  description:
    "Hệ thống quản lý cửa hàng vàng bạc đá quý - quản lý sản phẩm, đơn hàng, khách hàng và giá vàng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`h-full antialiased ${inter.variable}`}>
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider>
          <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

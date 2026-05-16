import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

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
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";
import { AppHeroUIProvider } from "@/providers/HeroUIProvider";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: `${APP_NAME} - Multi-Vendor E-Commerce Platform`,
  description: "Modern multi-vendor e-commerce platform for customers, sellers, and administrators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <AppHeroUIProvider>
          <AppShell>{children}</AppShell>
        </AppHeroUIProvider>
      </body>
    </html>
  );
}

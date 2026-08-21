import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { APP_NAME } from "@/lib/constants";
import { AppHeroUIProvider } from "@/providers/HeroUIProvider";

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
          <Navbar />
          <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </AppHeroUIProvider>
      </body>
    </html>
  );
}

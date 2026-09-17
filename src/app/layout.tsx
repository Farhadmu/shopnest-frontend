import dns from 'node:dns'
dns.setServers(['8.8.8.8','8.8.4.4'])

import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";
import { AppHeroUIProvider } from "@/providers/HeroUIProvider";
import { ConfirmDialogProvider } from "@/context/ConfirmDialogContext";
import { AppQueryClientProvider } from "@/providers/QueryClientProvider";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeBootstrap } from "@/components/layout/ThemeBootstrap";

export const metadata: Metadata = {
  title: `${APP_NAME} - Multi-Vendor E-Commerce Platform`,
  description:
    "Modern multi-vendor e-commerce platform for customers, sellers, and administrators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="flex min-h-screen flex-col bg-background text-text"
      >
        <div className="flex min-h-screen w-full flex-col overflow-x-clip">
          <ThemeBootstrap />
          <AppQueryClientProvider>
            <AppHeroUIProvider>
              <ConfirmDialogProvider>
                <AppShell>{children}</AppShell>
              </ConfirmDialogProvider>
            </AppHeroUIProvider>
          </AppQueryClientProvider>
        </div>
      </body>
    </html>
  );
}

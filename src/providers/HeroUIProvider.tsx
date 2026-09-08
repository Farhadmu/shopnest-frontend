"use client";

import React from "react";
import { RouterProvider } from "@heroui/react";
import { useRouter } from "next/navigation";

export interface AppHeroUIProviderProps {
  children: React.ReactNode;
}

export function AppHeroUIProvider({ children }: AppHeroUIProviderProps) {
  const router = useRouter();
  return <RouterProvider navigate={router.push}>{children}</RouterProvider>;
}

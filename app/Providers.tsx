"use client"

import { TRPCProvider } from "@/lib/trpc/provider";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <SessionProvider>
        {children}
      </SessionProvider>
    </TRPCProvider>
  )
}
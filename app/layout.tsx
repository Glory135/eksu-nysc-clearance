import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { TRPCProvider } from "@/lib/trpc/provider"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "EKSU NYSC Clearance System",
  description: "Ekiti State University NYSC Mobilization Clearance System",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <TRPCProvider>
          <Suspense fallback={null}>
            {children}
            <Toaster position="top-right" />
          </Suspense>
        </TRPCProvider>
        <Analytics />
      </body>
    </html>
  )
}

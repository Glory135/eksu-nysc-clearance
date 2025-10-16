import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { Suspense } from "react"
import "./globals.css"
import { Providers } from "./Providers"
import { LoaderIcon } from "lucide-react"

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
        <Providers>
          <Suspense fallback={
            <div className="w-screen bg-background h-screen flex justify-center items-center"><LoaderIcon /></div>
          }>
            {children}
            <Toaster position="top-right" />
          </Suspense>
        </Providers>
        {/* <Analytics /> */}
      </body>
    </html>
  )
}

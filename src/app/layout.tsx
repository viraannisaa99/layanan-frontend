import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import NextTopLoader from "nextjs-toploader"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import { AuthProvider } from "@/components/providers/session-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "PCR HR Portal",
  description: "Internal human resources workspace for the PCR team.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <ThemeProvider>
          <NuqsAdapter>
            <AuthProvider>
              <QueryProvider>{children}</QueryProvider>
            </AuthProvider>
          </NuqsAdapter>
          <NextTopLoader
            color="#0ea5e9"
            height={3}
            crawlSpeed={200}
            showSpinner={false}
            shadow={false}
          />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--background)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}

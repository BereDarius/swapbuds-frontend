import { Footer } from "@/components/layout/footer";
import { LayoutContent } from "@/components/layout/layout-content";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "SwapBuds - Trade Items with Your Community",
  description:
    "Peer-to-peer trading platform for collectors, gamers, and enthusiasts. Trade items safely with verified users in your community.",
  keywords: [
    "trading",
    "swap",
    "marketplace",
    "peer-to-peer",
    "collectibles",
    "games",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <LayoutContent>
            <div className="flex min-h-screen flex-col">
              {/* Reserve space for navbar to prevent CLS */}
              <div className="h-16" aria-hidden="true" />
              <Navbar />
              <main
                className="flex-1"
                style={{ minHeight: "calc(100vh - 16rem)" }}
              >
                {children}
              </main>
              <Footer />
            </div>
          </LayoutContent>
        </Providers>
      </body>
    </html>
  );
}

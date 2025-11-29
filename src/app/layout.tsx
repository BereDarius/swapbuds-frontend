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
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <LayoutContent>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </LayoutContent>
        </Providers>
      </body>
    </html>
  );
}

"use client";

import { Package } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">SwapBuds</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Peer-to-peer trading platform for collectors, gamers, and
              enthusiasts.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/items"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Browse Items
                </Link>
              </li>
              <li>
                <Link
                  href="/trades"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  My Trades
                </Link>
              </li>
              <li>
                <Link
                  href="/items/new"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  List Item
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/support"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/disputes"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Report an Issue
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} SwapBuds. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

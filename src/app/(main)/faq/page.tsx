import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - SwapBuds",
  description:
    "Frequently asked questions about SwapBuds peer-to-peer trading platform",
};

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Frequently Asked Questions</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>How does SwapBuds work?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              SwapBuds is a peer-to-peer trading platform where you can list
              items you want to trade, browse other users&apos; items, and
              propose trades. Once a trade is accepted, you can chat with the
              other user to arrange the exchange.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Is SwapBuds free to use?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Yes! SwapBuds is completely free to use. We don&apos;t charge any
              fees for listing items or completing trades.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How do I stay safe while trading?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Always verify user identities through our verification system,
              meet in public places for in-person exchanges, and use our
              built-in chat system to keep all communication on the platform.
              Report any suspicious activity to our moderation team.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What if I have a problem with a trade?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Contact our support team immediately through the support page. We
              have a dispute resolution process to help resolve issues between
              traders.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

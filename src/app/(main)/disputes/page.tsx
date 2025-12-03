import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Report an Issue - SwapBuds",
  description: "Report issues or disputes with trades on SwapBuds",
};

export default function DisputesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <CardTitle className="text-2xl">Report an Issue</CardTitle>
                <CardDescription>
                  Having a problem with a trade or another user?
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-2 font-semibold">What can you report?</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Trade disputes or disagreements</li>
                <li>Suspicious or fraudulent behavior</li>
                <li>Inappropriate content or messages</li>
                <li>Terms of service violations</li>
                <li>Safety concerns</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">How to report</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                For trade-related issues or user reports, please contact our
                support team with detailed information about the problem.
                Include trade IDs, usernames, and any relevant screenshots.
              </p>
            </div>

            <div className="flex gap-3">
              <Button asChild>
                <Link href="/support">Contact Support</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/guidelines">View Guidelines</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

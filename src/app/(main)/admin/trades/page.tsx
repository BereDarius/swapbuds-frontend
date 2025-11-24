/**
 * Admin Problematic Trades Page
 *
 * View and manage trades with issues
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function AdminTradesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Problematic Trades</h2>
        <p className="text-muted-foreground">
          Monitor and resolve trade disputes
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ShieldAlert className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Trade dispute management will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

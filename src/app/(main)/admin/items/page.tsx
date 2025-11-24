/**
 * Admin Flagged Items Page
 *
 * View and manage flagged/reported items
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Flag } from "lucide-react";

export default function AdminItemsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Flagged Items</h2>
        <p className="text-muted-foreground">
          Review and moderate reported items
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Flag className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Flagged items moderation will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

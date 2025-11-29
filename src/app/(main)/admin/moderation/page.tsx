/**
 * Admin Moderation Page
 *
 * Dashboard for moderators and admins to review flagged content.
 * Protected route - requires ADMIN or MODERATOR role.
 */

"use client";

import { ModerationPanel } from "@/components/moderation/moderation-panel";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ModerationPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
      router.push("/");
    }
  }, [user, router]);

  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="mt-2 text-muted-foreground">
          Review flagged comments and take appropriate actions to maintain
          community standards.
        </p>
      </div>

      <ModerationPanel />
    </div>
  );
}

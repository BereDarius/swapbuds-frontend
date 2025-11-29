"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { VerificationRequest } from "@/types/verification";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminVerificationPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: verifications, isLoading } = useQuery<VerificationRequest[]>({
    queryKey: ["admin-verifications-pending"],
    queryFn: async () => {
      const response = await api.get("/verification/admin/pending");
      return response.data.verifications || [];
    },
    enabled: user?.role === "ADMIN",
  });

  if (user?.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="mb-2 text-3xl font-bold">Verification Requests</h1>
          <p className="text-muted-foreground">
            Review and approve ID verification requests
          </p>
        </div>
      </div>

      {verifications && verifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              No Pending Verifications
            </h3>
            <p className="text-muted-foreground">
              All verification requests have been processed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {verifications?.map((verification) => (
            <Link
              key={verification.id}
              href={`/admin/verification/${verification.id}`}
            >
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex flex-1 items-center gap-4">
                    <Badge variant="secondary">
                      <Clock className="mr-1 h-3 w-3" />
                      Pending
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium">
                        {verification.documentType.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        User ID:{" "}
                        <span className="font-mono">
                          {verification.userId.slice(0, 8)}...
                        </span>
                      </p>
                      {verification.notes && (
                        <p className="mt-1 text-sm text-muted-foreground italic">
                          Notes:{" "}
                          {verification.notes.length > 100
                            ? verification.notes.slice(0, 100) + "..."
                            : verification.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      {new Date(verification.submittedAt).toLocaleDateString()}
                    </p>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

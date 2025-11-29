"use client";

import { MarkdownContent } from "@/components/legal/markdown-content";
import { Skeleton } from "@/components/ui/skeleton";
import { getActiveLegalDocument } from "@/lib/api/legal";
import { Language, LegalDocumentType } from "@/types/legal";
import { useQuery } from "@tanstack/react-query";

export default function CookiePolicyPage() {
  const { data: document, isLoading } = useQuery({
    queryKey: ["legal-document", LegalDocumentType.COOKIE_POLICY],
    queryFn: () =>
      getActiveLegalDocument(LegalDocumentType.COOKIE_POLICY, Language.EN),
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Cookie Policy</h1>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : document ? (
        <>
          <MarkdownContent content={document.content} />
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Version {document.version} • Effective from{" "}
            {new Date(document.effectiveAt).toLocaleDateString()}
          </p>
        </>
      ) : (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
          <p className="text-destructive">
            Cookie Policy not available. Please try again later.
          </p>
        </div>
      )}
    </div>
  );
}

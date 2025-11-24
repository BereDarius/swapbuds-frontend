"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getActiveLegalDocument } from "@/lib/api/legal";
import { Language, LegalDocumentType } from "@/types/legal";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface LegalDocumentViewerProps {
  documentType: LegalDocumentType;
  title: string;
  description: string;
}

/**
 * LegalDocumentViewer Component
 *
 * Displays legal documents with language toggle (EN/RO), version info,
 * and formatted Markdown content.
 *
 * Features:
 * - Language toggle between English and Romanian
 * - Loading states with skeletons
 * - Error handling
 * - Version and effective date display
 * - Responsive design
 * - Markdown rendering with proper typography
 *
 * @example
 * ```tsx
 * <LegalDocumentViewer
 *   documentType={LegalDocumentType.TOS}
 *   title="Terms of Service"
 *   description="Please read our terms carefully"
 * />
 * ```
 */
export function LegalDocumentViewer({
  documentType,
  title,
  description,
}: LegalDocumentViewerProps) {
  const [language, setLanguage] = useState<Language>(Language.EN);

  const {
    data: document,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["legal-document", documentType, language],
    queryFn: () => getActiveLegalDocument(documentType, language),
  });

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">
            Error Loading Document
          </CardTitle>
          <CardDescription>
            Failed to load the {title.toLowerCase()}. Please try again later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-muted-foreground">{description}</p>
        </div>

        {/* Language Toggle */}
        <div className="flex gap-2">
          <Button
            variant={language === Language.EN ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage(Language.EN)}
          >
            English
          </Button>
          <Button
            variant={language === Language.RO ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage(Language.RO)}
          >
            Română
          </Button>
        </div>
      </div>

      {/* Document Info */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      ) : document ? (
        <div className="text-sm text-muted-foreground">
          <p>Version: {document.version}</p>
          <p>
            Effective from:{" "}
            {new Date(document.effectiveFrom).toLocaleDateString(
              language === Language.RO ? "ro-RO" : "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            )}
          </p>
        </div>
      ) : null}

      {/* Document Content */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
            </div>
          ) : document ? (
            <div className="prose prose-gray max-w-none dark:prose-invert">
              <ReactMarkdown>
                {language === Language.EN
                  ? document.contentEn
                  : document.contentRo}
              </ReactMarkdown>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Last Updated */}
      {!isLoading && document && (
        <p className="text-center text-xs text-muted-foreground">
          {language === Language.EN ? "Last updated: " : "Ultima actualizare: "}
          {new Date(document.updatedAt).toLocaleDateString(
            language === Language.RO ? "ro-RO" : "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            },
          )}
        </p>
      )}
    </div>
  );
}

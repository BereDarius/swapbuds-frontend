import { MarkdownContent } from "@/components/legal/markdown-content";
import { getActiveLegalDocument } from "@/lib/api/legal";
import { Language, LegalDocumentType } from "@/types/legal";

// Static generation with revalidation every 24 hours
export const revalidate = 86400;

export default async function CookiePolicyPage() {
  const document = await getActiveLegalDocument(
    LegalDocumentType.COOKIE_POLICY,
    Language.EN
  ).catch(() => null);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Cookie Policy</h1>

      {document ? (
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

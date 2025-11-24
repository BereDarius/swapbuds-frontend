import { LegalDocumentViewer } from "@/components/legal/legal-document-viewer";
import { LegalDocumentType } from "@/types/legal";

export const metadata = {
  title: "Cookie Policy | SwapBuds",
  description: "Understand how we use cookies and similar technologies",
};

export default function CookiePolicyPage() {
  return (
    <div className="container py-8">
      <LegalDocumentViewer
        documentType={LegalDocumentType.COOKIE_POLICY}
        title="Cookie Policy"
        description="Learn about the cookies we use and how to manage your preferences."
      />
    </div>
  );
}

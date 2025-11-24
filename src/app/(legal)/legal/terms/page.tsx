import { LegalDocumentViewer } from "@/components/legal/legal-document-viewer";
import { LegalDocumentType } from "@/types/legal";

export const metadata = {
  title: "Terms of Service | SwapBuds",
  description: "Read our terms of service and user agreement",
};

export default function TermsOfServicePage() {
  return (
    <div className="container py-8">
      <LegalDocumentViewer
        documentType={LegalDocumentType.TOS}
        title="Terms of Service"
        description="By using SwapBuds, you agree to these terms. Please read them carefully."
      />
    </div>
  );
}

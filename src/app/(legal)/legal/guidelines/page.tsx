import { LegalDocumentViewer } from "@/components/legal/legal-document-viewer";
import { LegalDocumentType } from "@/types/legal";

export const metadata = {
  title: "Community Guidelines | SwapBuds",
  description: "Rules and guidelines for participating in our community",
};

export default function CommunityGuidelinesPage() {
  return (
    <div className="container py-8">
      <LegalDocumentViewer
        documentType={LegalDocumentType.COMMUNITY_GUIDELINES}
        title="Community Guidelines"
        description="Help us maintain a safe and respectful community for everyone."
      />
    </div>
  );
}

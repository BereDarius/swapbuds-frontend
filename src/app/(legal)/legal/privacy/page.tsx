import { LegalDocumentViewer } from "@/components/legal/legal-document-viewer";
import { LegalDocumentType } from "@/types/legal";

export const metadata = {
  title: "Privacy Policy | SwapBuds",
  description: "Learn how we collect, use, and protect your personal data",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-8">
      <LegalDocumentViewer
        documentType={LegalDocumentType.PRIVACY_POLICY}
        title="Privacy Policy"
        description="Your privacy is important to us. Learn how we handle your data."
      />
    </div>
  );
}

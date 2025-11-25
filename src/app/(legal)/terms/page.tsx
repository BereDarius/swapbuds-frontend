import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              By accessing and using SwapBuds (&quot;the Platform&quot;), you
              accept and agree to be bound by these Terms of Service. If you do
              not agree to these terms, please do not use our services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>You must be at least 18 years old to use SwapBuds.</p>
            <p>
              You must provide accurate and complete information during
              registration.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Trading Rules</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              All items listed must be accurately described and photographed.
            </p>
            <p>
              Prohibited items include weapons, illegal substances, counterfeit
              goods, and stolen property.
            </p>
            <p>
              Users are responsible for completing agreed-upon trades in good
              faith.
            </p>
            <p>
              SwapBuds is not responsible for the quality, safety, or legality
              of items traded.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. User Conduct</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              Users must treat others with respect and refrain from harassment
              or abusive behavior.
            </p>
            <p>Spam, scams, and fraudulent activity are strictly prohibited.</p>
            <p>
              Users must not misrepresent items or engage in deceptive
              practices.
            </p>
            <p>
              SwapBuds reserves the right to suspend or ban accounts that
              violate these rules.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Privacy and Data</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Your privacy is important to us. Please review our Privacy Policy
              to understand how we collect, use, and protect your personal
              information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              All content on SwapBuds, including logos, designs, and text, is
              the property of SwapBuds or its licensors. Users retain ownership
              of their uploaded content but grant SwapBuds a license to display
              it on the Platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              SwapBuds is a platform that facilitates peer-to-peer trading. We
              are not a party to any trades.
            </p>
            <p>
              We are not liable for disputes, losses, damages, or injuries
              arising from trades.
            </p>
            <p>
              Users trade at their own risk and should exercise caution when
              meeting others or shipping items.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Termination</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              SwapBuds reserves the right to terminate or suspend accounts at
              any time for violations of these Terms or other misconduct. Users
              may delete their accounts at any time through account settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              SwapBuds may update these Terms from time to time. Continued use
              of the Platform after changes constitutes acceptance of the new
              Terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Contact</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              For questions about these Terms, please contact us at
              support@swapbuds.com
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground pt-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

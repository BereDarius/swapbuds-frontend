import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              <strong>Account Information:</strong> Username, email, date of
              birth, password (hashed), location, bio, avatar.
            </p>
            <p>
              <strong>Item Data:</strong> Photos, descriptions, categories,
              estimated values, delivery preferences.
            </p>
            <p>
              <strong>Trade Data:</strong> Trade proposals, messages, reviews,
              ratings.
            </p>
            <p>
              <strong>Usage Data:</strong> IP address, device type, browser,
              pages visited, interactions.
            </p>
            <p>
              <strong>Verification Data:</strong> ID documents (for age and
              identity verification).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>To provide and improve our trading platform services.</p>
            <p>To verify user identities and prevent fraud.</p>
            <p>To facilitate trades and communication between users.</p>
            <p>
              To send notifications about trades, messages, and platform
              updates.
            </p>
            <p>To enforce our Terms of Service and Community Guidelines.</p>
            <p>To analyze platform usage and improve user experience.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Information Sharing</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              <strong>Public Information:</strong> Usernames, avatars, item
              listings, reviews, and reputation scores are publicly visible.
            </p>
            <p>
              <strong>Trade Partners:</strong> When you engage in a trade, the
              other party can see your profile and item details.
            </p>
            <p>
              <strong>Service Providers:</strong> We share data with trusted
              third parties (e.g., Cloudinary for images, SendGrid for emails).
            </p>
            <p>
              <strong>Legal Requirements:</strong> We may disclose information
              if required by law or to protect our rights and users.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Data Security</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              We use industry-standard security measures including encryption,
              secure servers, and access controls to protect your data. However,
              no system is 100% secure, and we cannot guarantee absolute
              security.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Your Rights (GDPR)</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              <strong>Access:</strong> Request a copy of your personal data.
            </p>
            <p>
              <strong>Correction:</strong> Update inaccurate or incomplete
              information.
            </p>
            <p>
              <strong>Deletion:</strong> Request deletion of your account and
              data (subject to legal obligations).
            </p>
            <p>
              <strong>Portability:</strong> Receive your data in a
              machine-readable format.
            </p>
            <p>
              <strong>Objection:</strong> Object to certain data processing
              activities.
            </p>
            <p>To exercise your rights, contact privacy@swapbuds.com</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              We use cookies and similar technologies to maintain sessions,
              remember preferences, and analyze usage. You can control cookies
              through your browser settings, but disabling them may affect
              functionality.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Children&apos;s Privacy</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              SwapBuds is not intended for users under 18. We do not knowingly
              collect data from minors. If we learn that we have collected
              information from a minor, we will delete it promptly.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              We retain your data for as long as your account is active or as
              needed to provide services. Deleted account data is removed within
              30 days, except where required by law.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Changes to Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              We may update this Privacy Policy periodically. We will notify
              users of significant changes via email or platform notifications.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              For privacy-related questions or requests, contact
              privacy@swapbuds.com
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

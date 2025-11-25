import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GuidelinesPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Community Guidelines</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to SwapBuds!</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Our community is built on trust, respect, and fair trading. These
              guidelines help ensure a safe and positive experience for all
              users. Violations may result in warnings, suspensions, or
              permanent bans.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Be Honest and Transparent</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>✅ Provide accurate descriptions and clear photos of items.</p>
            <p>✅ Disclose any flaws, damage, or missing parts.</p>
            <p>✅ Accurately represent the condition and value of items.</p>
            <p>❌ Do not mislead others or hide important details.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Respect Other Users</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>✅ Communicate politely and professionally.</p>
            <p>✅ Respect others&apos; time and decisions.</p>
            <p>❌ No harassment, threats, or abusive language.</p>
            <p>
              ❌ No discrimination based on race, gender, religion, or other
              protected characteristics.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Follow Through on Trades</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>✅ Honor trade agreements once accepted.</p>
            <p>✅ Communicate promptly if issues arise.</p>
            <p>✅ Package items securely for shipping.</p>
            <p>❌ Do not ghost users or fail to deliver agreed items.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prohibited Items</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>❌ Weapons, explosives, or dangerous materials.</p>
            <p>❌ Illegal drugs or substances.</p>
            <p>❌ Counterfeit or pirated goods.</p>
            <p>❌ Stolen property.</p>
            <p>❌ Adult content or services.</p>
            <p>❌ Live animals (except in specific approved categories).</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>No Scams or Fraud</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>❌ Do not request payments outside the platform.</p>
            <p>❌ Do not create fake accounts or manipulate ratings.</p>
            <p>❌ Do not engage in phishing or identity theft.</p>
            <p>✅ Report suspicious activity to our support team.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safety First</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>✅ Meet in public, well-lit places for in-person trades.</p>
            <p>✅ Let someone know where you&apos;re going.</p>
            <p>✅ Inspect items before completing the trade.</p>
            <p>
              ❌ Do not share sensitive personal information (e.g., home
              address, bank details).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Standards</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>✅ Use appropriate language and images.</p>
            <p>❌ No spam, excessive self-promotion, or advertising.</p>
            <p>❌ No offensive, graphic, or inappropriate content.</p>
            <p>❌ No impersonation or fake profiles.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reporting and Disputes</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              ✅ Use the report feature to flag inappropriate items, users, or
              behavior.
            </p>
            <p>✅ Open a dispute if a trade goes wrong.</p>
            <p>
              ✅ Provide evidence (screenshots, photos) to support your case.
            </p>
            <p>Our moderation team reviews reports within 24-48 hours.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>✅ Use a strong, unique password.</p>
            <p>✅ Keep your account credentials private.</p>
            <p>✅ Log out on shared devices.</p>
            <p>❌ Do not share your account with others.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enforcement</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              <strong>First Violation:</strong> Warning or temporary suspension.
            </p>
            <p>
              <strong>Repeated Violations:</strong> Longer suspension or
              permanent ban.
            </p>
            <p>
              <strong>Serious Violations:</strong> Immediate permanent ban and
              potential legal action.
            </p>
            <p>Moderators have final discretion on enforcement decisions.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions or Concerns?</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              If you have questions about these guidelines or need help, contact
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

import * as chromeLauncher from "chrome-launcher";
import fs from "fs";
import lighthouse from "lighthouse";
import path from "path";

// Page configurations with roles
const pages = {
  public: [
    { url: "http://localhost:3000", name: "home" },
    { url: "http://localhost:3000/login", name: "login" },
    { url: "http://localhost:3000/register", name: "register" },
    { url: "http://localhost:3000/terms", name: "terms" },
    { url: "http://localhost:3000/privacy", name: "privacy" },
    { url: "http://localhost:3000/guidelines", name: "guidelines" },
    { url: "http://localhost:3000/cookies", name: "cookies" },
  ],
  user: [
    { url: "http://localhost:3000/items", name: "items" },
    { url: "http://localhost:3000/items/new", name: "items-new" },
    { url: "http://localhost:3000/trades", name: "trades" },
    { url: "http://localhost:3000/messages", name: "messages" },
    { url: "http://localhost:3000/notifications", name: "notifications" },
    { url: "http://localhost:3000/settings", name: "settings" },
    { url: "http://localhost:3000/support", name: "support" },
    { url: "http://localhost:3000/verification", name: "verification" },
  ],
  admin: [
    { url: "http://localhost:3000/admin", name: "admin-dashboard" },
    { url: "http://localhost:3000/admin/users", name: "admin-users" },
    {
      url: "http://localhost:3000/admin/verification",
      name: "admin-verification",
    },
    {
      url: "http://localhost:3000/admin/moderation",
      name: "admin-moderation",
    },
  ],
};

async function runLighthouse(url, name, cookies = null) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--no-sandbox", "--disable-setuid-sandbox"],
  });

  const options = {
    logLevel: "info",
    output: ["html", "json"],
    port: chrome.port,
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  };

  // Add cookies if authenticated
  if (cookies) {
    options.extraHeaders = {
      Cookie: cookies.map((c) => `${c.name}=${c.value}`).join("; "),
    };
  }

  try {
    const runnerResult = await lighthouse(url, options);

    if (!runnerResult) {
      console.error(`❌ No result returned for ${name}`);
      await chrome.kill();
      return false;
    }

    // Save reports
    const reportDir = "./.lighthouseci";
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = Date.now();
    // Sanitize name to prevent path traversal
    const safeName = name.replace(/[^a-z0-9-]/gi, "_");
    const htmlPath = path.join(reportDir, `${safeName}-${timestamp}.html`);
    const jsonPath = path.join(reportDir, `${safeName}-${timestamp}.json`);

    fs.writeFileSync(htmlPath, runnerResult.report[0]);
    fs.writeFileSync(jsonPath, runnerResult.report[1]);

    // Check scores - Different thresholds for different categories
    const scores = runnerResult.lhr.categories;

    // Performance: 85% (realistic for complex apps with SSR)
    // Accessibility & Best Practices: 90% (strict)
    // SEO: 90% for public pages, 60% for admin (intentionally blocked from search engines)
    const perfFailed = (scores.performance?.score ?? 0) < 0.85;
    const a11yBpFailed = [scores.accessibility, scores["best-practices"]].some(
      (category) => (category?.score ?? 0) < 0.9
    );

    const seoThreshold = name.startsWith("admin") ? 0.6 : 0.9;
    const seoFailed = (scores.seo?.score ?? 0) < seoThreshold;

    const failed = perfFailed || a11yBpFailed || seoFailed;
    console.log(`📊 ${name} Scores:`);
    console.log(
      `   Performance: ${((scores.performance.score ?? 0) * 100).toFixed(0)}`
    );
    console.log(
      `   Accessibility: ${((scores.accessibility.score ?? 0) * 100).toFixed(0)}`
    );
    console.log(
      `   Best Practices: ${((scores["best-practices"]?.score ?? 0) * 100).toFixed(0)}`
    );
    console.log(`   SEO: ${((scores.seo.score ?? 0) * 100).toFixed(0)}`);

    await chrome.kill();
    return !failed;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error testing ${name}:`, errorMessage);
    await chrome.kill();
    return false;
  }
}

async function main() {
  let allPassed = true;

  // Test public pages (no auth)
  console.log("\n🌐 Testing Public Pages...");
  for (const page of pages.public) {
    const passed = await runLighthouse(page.url, page.name);
    if (!passed) allPassed = false;
  }

  // Test user pages (authenticated as regular user)
  console.log("\n👤 Testing User Pages...");
  const userCookies = JSON.parse(
    fs.readFileSync(".lighthouse-cookies-user.json", "utf8")
  );
  for (const page of pages.user) {
    const passed = await runLighthouse(page.url, page.name, userCookies);
    if (!passed) allPassed = false;
  }

  // Test admin pages (authenticated as admin)
  console.log("\n⚙️ Testing Admin Pages...");
  const adminCookies = JSON.parse(
    fs.readFileSync(".lighthouse-cookies-admin.json", "utf8")
  );
  for (const page of pages.admin) {
    const passed = await runLighthouse(page.url, page.name, adminCookies);
    if (!passed) allPassed = false;
  }

  if (!allPassed) {
    console.error("\n❌ Some pages failed Lighthouse audits");
    process.exit(1);
  }

  console.log("\n✅ All pages passed Lighthouse audits");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

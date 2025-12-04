#!/usr/bin/env ts-node

/**
 * Lighthouse Results Checker
 *
 * Analyzes Lighthouse JSON reports and provides actionable insights
 * for improving performance, accessibility, best practices, and SEO scores.
 *
 * Usage:
 *   tsx scripts/check-lighthouse-results.ts
 *   tsx scripts/check-lighthouse-results.ts lighthouse-reports/home-desktop.report.json
 *
 * Results are automatically saved to lighthouse-results.txt (gitignored)
 */

import * as fs from "fs";
import * as path from "path";

// Output file for saving results
const OUTPUT_FILE = path.join(__dirname, "..", "lighthouse-results.txt");
const outputBuffer: string[] = [];

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
} as const;

type Color = keyof typeof colors;

// Performance thresholds
const THRESHOLDS = {
  performance: 90,
  accessibility: 90,
  bestPractices: 90,
  seo: 90,
  pwa: 50,
} as const;

const METRIC_THRESHOLDS = {
  "first-contentful-paint": 2000, // ms
  "largest-contentful-paint": 2500, // ms
  "total-blocking-time": 300, // ms
  "cumulative-layout-shift": 0.1,
  "speed-index": 3000, // ms
  interactive: 3500, // ms
} as const;

interface LighthouseAudit {
  score: number | null;
  numericValue?: number;
  title: string;
  description?: string;
  scoreDisplayMode?: string;
  details?: {
    type: string;
    [key: string]: unknown;
  };
}

interface LighthouseCategory {
  score: number;
  title: string;
}

interface LighthouseReport {
  runtimeError?: {
    code: string;
    message: string;
  };
  categories: Record<string, LighthouseCategory>;
  audits: Record<string, LighthouseAudit>;
}

interface CategoryResult {
  key: string;
  title: string;
  score: number;
  threshold: number;
  pass: boolean;
}

interface MetricResult {
  key: string;
  label: string;
  value: number;
  threshold: number;
  pass: boolean;
}

function colorize(text: string, color: Color): string {
  return `${colors[color]}${text}${colors.reset}`;
}

function log(text: string, skipFile = false): void {
  console.log(text);
  if (!skipFile) {
    // Strip ANSI color codes for file output
    const cleanText = text.replace(/\x1b\[[0-9;]*m/g, "");
    outputBuffer.push(cleanText);
  }
}

function getScoreColor(score: number): Color {
  if (score >= 90) return "green";
  if (score >= 50) return "yellow";
  return "red";
}

function getScoreEmoji(score: number): string {
  if (score >= 90) return "✅";
  if (score >= 50) return "⚠️";
  return "❌";
}

/**
 * Safely strip all HTML tags from a string to prevent injection
 * Uses multiple passes to handle nested/obfuscated tags like <<script>>
 */
function stripHtml(text: string): string {
  let result = text;
  let previousResult = "";

  // Keep stripping until no more changes (handles <<tag>> patterns)
  while (result !== previousResult) {
    previousResult = result;
    result = result.replace(/<[^>]*>/g, "");
  }

  return result;
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function analyzeLighthouseReport(reportPath: string): void {
  log(colorize(`\n${"=".repeat(80)}`, "cyan"));
  log(colorize(`📊 Analyzing: ${path.basename(reportPath)}`, "bold"));
  log(colorize(`${"=".repeat(80)}\n`, "cyan"));

  const reportData: LighthouseReport = JSON.parse(
    fs.readFileSync(reportPath, "utf8")
  );

  // Check for runtime errors
  if (reportData.runtimeError) {
    log(
      colorize(`❌ Runtime Error: ${reportData.runtimeError.message}`, "red")
    );
    log(colorize("\nThe page failed to load. Check that:", "yellow"));
    log("  • The server is running");
    log("  • The URL is correct");
    log("  • There are no network issues\n");
    return;
  }

  const { categories, audits } = reportData;

  // Display category scores
  log(colorize("📈 Category Scores:", "bold"));
  log(colorize("─".repeat(80), "cyan"));

  const categoryResults: CategoryResult[] = [];
  Object.entries(categories).forEach(([key, category]) => {
    const score = Math.round(category.score * 100);
    const color = getScoreColor(score);
    const emoji = getScoreEmoji(score);
    const threshold = THRESHOLDS[key as keyof typeof THRESHOLDS] || 50;
    const status = score >= threshold ? "PASS" : "FAIL";

    log(
      `${emoji} ${category.title.padEnd(30)} ${colorize(score.toString().padStart(3), color)}% (${colorize(status, color)})`
    );

    categoryResults.push({
      key,
      title: category.title,
      score,
      threshold,
      pass: score >= threshold,
    });
  });

  // Display key metrics
  log(colorize("\n⏱️  Core Web Vitals:", "bold"));
  log(colorize("─".repeat(80), "cyan"));

  const metrics: Record<string, string> = {
    "first-contentful-paint": "First Contentful Paint (FCP)",
    "largest-contentful-paint": "Largest Contentful Paint (LCP)",
    "total-blocking-time": "Total Blocking Time (TBT)",
    "cumulative-layout-shift": "Cumulative Layout Shift (CLS)",
    "speed-index": "Speed Index",
    interactive: "Time to Interactive (TTI)",
  };

  const metricResults: MetricResult[] = [];
  Object.entries(metrics).forEach(([key, label]) => {
    const audit = audits[key];
    if (audit && audit.numericValue !== undefined) {
      const value = audit.numericValue;
      const threshold =
        METRIC_THRESHOLDS[key as keyof typeof METRIC_THRESHOLDS];
      let displayValue: string;
      let pass: boolean;

      if (key === "cumulative-layout-shift") {
        displayValue = value.toFixed(3);
        pass = value <= threshold;
      } else {
        displayValue = formatMs(value);
        pass = value <= threshold;
      }

      const color = pass
        ? "green"
        : value <= threshold * 1.5
          ? "yellow"
          : "red";
      const emoji = pass ? "✅" : "⚠️";
      const status = pass ? "GOOD" : "NEEDS WORK";

      log(
        `${emoji} ${label.padEnd(40)} ${colorize(displayValue.padStart(12), color)} (${colorize(status, color)})`
      );

      metricResults.push({ key, label, value, threshold, pass });
    }
  });

  // Identify failing audits
  const failingAudits = Object.entries(audits)
    .filter(([, audit]) => {
      return (
        audit.score !== null &&
        audit.score !== undefined &&
        audit.score < 1 &&
        audit.scoreDisplayMode !== "notApplicable"
      );
    })
    .sort((a, b) => a[1].score! - b[1].score!);

  if (failingAudits.length > 0) {
    log(colorize("\n🔍 Issues Found (Top 10):", "bold"));
    log(colorize("─".repeat(80), "cyan"));

    failingAudits.slice(0, 10).forEach(([, audit]) => {
      const score = Math.round(audit.score! * 100);
      const color = getScoreColor(score);
      log(
        `\n${colorize(audit.title, "bold")} ${colorize(`(${score}%)`, color)}`
      );
      if (audit.description) {
        log(`  ${stripHtml(audit.description).substring(0, 150)}...`);
      }
    });
  }

  // Performance opportunities
  const opportunities = Object.entries(audits)
    .filter(
      ([, audit]) => audit.details && audit.details.type === "opportunity"
    )
    .sort((a, b) => (b[1].numericValue || 0) - (a[1].numericValue || 0));

  if (opportunities.length > 0) {
    log(colorize("\n💡 Performance Opportunities:", "bold"));
    log(colorize("─".repeat(80), "cyan"));

    opportunities.slice(0, 5).forEach(([, audit]) => {
      const savings = audit.numericValue ? formatMs(audit.numericValue) : "N/A";
      log(
        `\n${colorize("⚡", "yellow")} ${colorize(audit.title, "bold")} (Potential savings: ${savings})`
      );
      if (audit.description) {
        log(`  ${stripHtml(audit.description).substring(0, 150)}...`);
      }
    });
  }

  // Summary
  log(colorize("\n📋 Summary:", "bold"));
  log(colorize("─".repeat(80), "cyan"));

  const failedCategories = categoryResults.filter((c) => !c.pass);
  const failedMetrics = metricResults.filter((m) => !m.pass);

  if (failedCategories.length === 0 && failedMetrics.length === 0) {
    log(
      colorize(
        "\n🎉 Excellent! All scores meet the required thresholds!",
        "green"
      )
    );
  } else {
    if (failedCategories.length > 0) {
      log(colorize("\n❌ Categories below threshold:", "red"));
      failedCategories.forEach((c) => {
        log(`  • ${c.title}: ${c.score}% (needs ${c.threshold}%)`);
      });
    }

    if (failedMetrics.length > 0) {
      log(colorize("\n⚠️  Metrics above threshold:", "yellow"));
      failedMetrics.forEach((m) => {
        const current =
          m.key === "cumulative-layout-shift"
            ? m.value.toFixed(3)
            : formatMs(m.value);
        const target =
          m.key === "cumulative-layout-shift"
            ? m.threshold.toFixed(3)
            : formatMs(m.threshold);
        log(`  • ${m.label}: ${current} (should be ≤ ${target})`);
      });
    }

    log(colorize("\n💡 Next steps:", "cyan"));
    log("  1. Focus on the opportunities listed above");
    log("  2. Review failing audits for specific fixes");
    log("  3. Check the full HTML report for detailed recommendations");
    log(`  4. Run: open ${reportPath.replace(".json", ".html")}`);
  }

  log(colorize(`\n${"=".repeat(80)}\n`, "cyan"));
}

function findLighthouseReports(): string[] {
  // Check both directories (LHCI and custom)
  const directories = [
    path.join(__dirname, "..", ".lighthouseci"),
    path.join(__dirname, "..", "lighthouse-reports"),
  ];

  let allFiles: string[] = [];

  for (const reportsDir of directories) {
    if (fs.existsSync(reportsDir)) {
      const files = fs
        .readdirSync(reportsDir)
        .filter((f) => {
          // Validate filename to prevent path traversal
          const isValid =
            f.endsWith(".json") &&
            !f.includes("token") &&
            !f.includes("..") &&
            !f.includes("/");
          return isValid;
        })
        .map((f) => path.join(reportsDir, f));
      allFiles = allFiles.concat(files);
    }
  }

  if (allFiles.length === 0) {
    console.log(colorize("❌ No Lighthouse reports found!", "red"));
    console.log("\nRun lighthouse tests first:");
    console.log("  npm run lighthouse:local");
    return [];
  }

  // Sort by modification time (most recent first)
  allFiles.sort((a, b) => {
    const statA = fs.statSync(a);
    const statB = fs.statSync(b);
    return statB.mtime.getTime() - statA.mtime.getTime();
  });

  return allFiles;
}

function main(): void {
  const args = process.argv.slice(2);

  // Add header with timestamp
  const timestamp = new Date().toISOString();
  log(colorize(`\n🚀 Lighthouse Results Analysis - ${timestamp}`, "bold"));

  if (args.length > 0) {
    // Analyze specific files provided as arguments
    args.forEach((reportPath) => {
      if (fs.existsSync(reportPath)) {
        analyzeLighthouseReport(reportPath);
      } else {
        log(colorize(`❌ File not found: ${reportPath}`, "red"));
      }
    });
  } else {
    // Find and analyze all reports
    const reports = findLighthouseReports();

    if (reports.length === 0) {
      log(colorize("\n❌ No Lighthouse reports found!", "red"));
      log("\nRun lighthouse tests first:");
      log("  npm run lighthouse:local\n");
      return;
    }

    // Group reports by page name and get the latest for each
    const latestReports = new Map<string, string>();
    reports.forEach((reportPath) => {
      const basename = path.basename(reportPath);
      // Extract page name (e.g., "home" from "home-1764744898271.json")
      const pageName = basename.split("-")[0];

      if (!latestReports.has(pageName)) {
        latestReports.set(pageName, reportPath);
      }
    });

    log(
      colorize(
        `\n📊 Found ${latestReports.size} unique page(s) (latest reports)\n`,
        "cyan"
      )
    );

    latestReports.forEach((reportPath) => {
      analyzeLighthouseReport(reportPath);
    });
  }

  // Save results to file
  try {
    fs.writeFileSync(OUTPUT_FILE, outputBuffer.join("\n"), "utf8");
    console.log(
      colorize(
        `\n💾 Results saved to: ${path.relative(process.cwd(), OUTPUT_FILE)}`,
        "green"
      )
    );
  } catch (error) {
    console.error(
      colorize(
        `\n⚠️  Failed to save results: ${error instanceof Error ? error.message : String(error)}`,
        "yellow"
      )
    );
  }
}

main();

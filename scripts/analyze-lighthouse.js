import { readdirSync, readFileSync, statSync } from "fs";

const files = readdirSync(".lighthouseci")
  .filter((f) => f.endsWith(".json"))
  .map((f) => ({ name: f, time: statSync(".lighthouseci/" + f).mtime }))
  .sort((a, b) => b.time - a.time)
  .slice(0, 19)
  .map((f) => f.name);

console.log("\n📊 Production Build Lighthouse Results:\n");
console.log(
  "Page".padEnd(25) +
    "Perf".padEnd(7) +
    "A11y".padEnd(7) +
    "BP".padEnd(7) +
    "SEO"
);
console.log("=".repeat(53));

files.forEach((f) => {
  const data = JSON.parse(readFileSync(".lighthouseci/" + f));
  const cats = data.categories;
  const name = f.replace(/-\d+\.json$/, "");
  const perf = Math.round((cats.performance?.score ?? 0) * 100);
  const a11y = Math.round((cats.accessibility?.score ?? 0) * 100);
  const bp = Math.round((cats["best-practices"]?.score ?? 0) * 100);
  const seo = Math.round((cats.seo?.score ?? 0) * 100);

  console.log(
    name.padEnd(25) +
      (perf + "%").padEnd(7) +
      (a11y + "%").padEnd(7) +
      (bp + "%").padEnd(7) +
      (seo + "%")
  );
});

console.log("\n");

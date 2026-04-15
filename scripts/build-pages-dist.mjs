/**
 * Copies only public funnel assets into dist/ for `wrangler pages deploy dist`.
 * Excludes operations/, .git, etc., so backups are not uploaded as static files.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

rmrf(dist);
fs.mkdirSync(dist, { recursive: true });

const rootFiles = [
  "index.html",
  "bridge.html",
  "payment.html",
  "site-onboarding.html",
  "booking.html",
  "thank-you.html",
  "builders.html",
  "onboarding-cold.html",
  "onboarding.html",
  "privacy-policy.html",
  "terms.html",
  "robots.txt",
  "sitemap.xml"
];

for (const f of rootFiles) {
  const src = path.join(root, f);
  if (fs.existsSync(src)) {
    copyRecursive(src, path.join(dist, f));
  } else {
    console.warn("skip missing:", f);
  }
}

const dirs = ["logos", "website examples", "Assets", "public"];
for (const d of dirs) {
  const src = path.join(root, d);
  if (fs.existsSync(src)) {
    copyRecursive(src, path.join(dist, d));
  }
}

console.log("dist ready at", dist);

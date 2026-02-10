#!/usr/bin/env node
/* eslint-disable no-console */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const SCAN_TARGETS = [
  "README.md",
  "docs",
  path.join("apps", "landing", "src"),
  path.join("apps", "docs", "content"),
  path.join("apps", "docs", "app"),
  path.join("apps", "docs", "lib"),
];

const SKIP_DIRS = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "data",
  ".vercel",
  ".turbo",
]);

const SCAN_EXTS = new Set([".md", ".mdx", ".ts", ".tsx", ".yaml", ".yml"]);

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
function isLocalOrExampleUrl(u) {
  try {
    const url = new URL(u);
    if (LOCAL_HOSTS.has(url.hostname)) return true;
    if (url.hostname.startsWith("coordinator-")) return true; // docker-compose examples
    // RPC / service endpoints shown in docs/config (not meant to be fetched via browser)
    if (url.hostname === "api.mainnet-beta.solana.com") return true;
    if (url.hostname === "api.devnet.solana.com") return true;
    return false;
  } catch {
    return true;
  }
}

function walkFiles(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];

  const st = fs.statSync(abs);
  if (st.isFile()) return [rel];

  const out = [];
  const entries = fs.readdirSync(abs, { withFileTypes: true });
  for (const ent of entries) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const childRel = path.join(rel, ent.name);
    const childAbs = path.join(ROOT, childRel);
    if (ent.isDirectory()) {
      out.push(...walkFiles(childRel));
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name);
      if (!SCAN_EXTS.has(ext)) continue;
      if (fs.statSync(childAbs).size > 2_000_000) continue; // skip huge files
      out.push(childRel);
    }
  }
  return out;
}

function extractUrls(text) {
  const urls = new Set();
  const re = /https?:\/\/[^\s<>"')\]]+/g;
  const matches = text.match(re) ?? [];
  for (let u of matches) {
    u = u
      .replace(/[.,;:]+$/, "")
      .replace(/[`]+$/, "")
      .replace(/\}+$|]+$/g, "");

    // Skip templated/placeholder URLs (e.g. `${process.env...}`)
    if (u.includes("${")) continue;

    // Skip XML namespaces that look like URLs in SVG/OG templates
    if (u === "http://www.w3.org/2000/svg") continue;

    // Basic sanity: must parse as a URL.
    try {
      // eslint-disable-next-line no-new
      new URL(u);
    } catch {
      continue;
    }

    urls.add(u);
  }
  return urls;
}

function ruleFor(url) {
  // Canonical "must be right" rules.
  // We validate final URL plus a light content signature for key links.
  const RULES = [
    {
      name: "Landing",
      match: /^https:\/\/www\.dispatch\.computer\/?$/,
      expectFinal: /^https:\/\/www\.dispatch\.computer\/?$/,
      bodyIncludes: ["Dispatch"],
      must: true,
    },
    {
      name: "Docs",
      match: /^https:\/\/docs\.dispatch\.computer(?:\/docs\/?)?$/,
      expectFinal: /^https:\/\/docs\.dispatch\.computer(?:\/docs\/?)?$/,
      bodyIncludes: ["Dispatch Docs"],
      must: true,
    },
    {
      name: "GitHub Repo",
      match: /^https:\/\/github\.com\/pranit-garg\/Dispatch\/?$/,
      expectFinal: /^https:\/\/github\.com\/pranit-garg\/Dispatch\/?$/,
      bodyIncludes: ["pranit-garg/Dispatch"],
      must: true,
    },
    {
      name: "Litepaper Viewer",
      match: /^https:\/\/github\.com\/pranit-garg\/Dispatch\/blob\/main\/docs\/Dispatch_Litepaper\.pdf$/,
      expectFinal: /^https:\/\/github\.com\/pranit-garg\/Dispatch\/blob\/main\/docs\/Dispatch_Litepaper\.pdf$/,
      bodyIncludes: ["Dispatch_Litepaper.pdf"],
      must: true,
    },
    {
      name: "Litepaper Download",
      match: /^https:\/\/github\.com\/pranit-garg\/Dispatch\/raw\/main\/docs\/Dispatch_Litepaper\.pdf$/,
      finalAllow: [
        /^https:\/\/github\.com\/pranit-garg\/Dispatch\/raw\/main\/docs\/Dispatch_Litepaper\.pdf$/,
        /^https:\/\/raw\.githubusercontent\.com\/pranit-garg\/Dispatch\/main\/docs\/Dispatch_Litepaper\.pdf$/,
      ],
      // GitHub sometimes serves this as application/octet-stream.
      contentType: /(application\/pdf|application\/octet-stream)/i,
      must: true,
    },
    {
      name: "Expo APK",
      match: /^https:\/\/expo\.dev\/artifacts\/eas\/[A-Za-z0-9_-]+\.apk$/,
      finalAllow: [
        /^https:\/\/expo\.dev\/artifacts\/eas\/[A-Za-z0-9_-]+\.apk$/,
        /^https:\/\/wf-artifacts\.eascdn\.net\/.*\.apk(\?.*)?$/,
      ],
      must: true,
    },
    {
      name: "x402",
      match: /^https:\/\/www\.x402\.org\/?$/,
      expectFinal: /^https:\/\/www\.x402\.org\/?$/,
      bodyIncludes: ["x402"],
      must: true,
    },
    {
      // Facilitator is an API base URL; it may return 404/405 at the root for GET/HEAD.
      // We probe /verify and accept a "client error" as evidence the route exists.
      name: "x402 Facilitator",
      match: /^https:\/\/www\.x402\.org\/facilitator\/?$/,
      probe: {
        path: "/verify",
        method: "POST",
        body: "{}",
        okStatus: [200, 400, 405, 415, 422],
      },
      must: false,
    },
    {
      name: "ERC-8004 Contracts",
      match: /^https:\/\/github\.com\/erc-8004\/erc-8004-contracts\/?$/,
      expectFinal: /^https:\/\/github\.com\/erc-8004\/erc-8004-contracts\/?$/,
      bodyIncludes: ["erc-8004-contracts"],
      must: true,
    },
    {
      name: "Solana dApp Store",
      match: /^https:\/\/dappstore\.app\/?$/,
      expectFinal: /^https:\/\/dappstore\.app\/?$/,
      bodyIncludes: ["dApp Store", "Solana"],
      must: false,
    },
  ];

  return RULES.find((r) => r.match.test(url));
}

async function fetchWithFallback(url) {
  const timeoutMs = 15_000;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // HEAD first (fast), then GET if not useful.
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "dispatch-link-checker/1.0 (+https://www.dispatch.computer)",
        accept: "*/*",
      },
    });
    if (head.status !== 405 && head.status !== 403) return { res: head, body: null };
  } catch {
    // ignore, fall back to GET
  } finally {
    clearTimeout(t);
  }

  const controller2 = new AbortController();
  const t2 = setTimeout(() => controller2.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller2.signal,
      headers: {
        "user-agent": "dispatch-link-checker/1.0 (+https://www.dispatch.computer)",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    const ct = res.headers.get("content-type") ?? "";
    if (/application\/pdf/i.test(ct)) return { res, body: null };
    const text = await res.text();
    return { res, body: text.slice(0, 250_000) }; // sniff only
  } finally {
    clearTimeout(t2);
  }
}

async function fetchProbe(baseUrl, probe) {
  const timeoutMs = 15_000;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const u = baseUrl.replace(/\/$/, "") + probe.path;
  try {
    const res = await fetch(u, {
      method: probe.method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "dispatch-link-checker/1.0 (+https://www.dispatch.computer)",
        accept: "application/json,text/plain,*/*",
        "content-type": "application/json",
      },
      body: probe.body,
    });
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const files = SCAN_TARGETS.flatMap((t) => walkFiles(t));
  const urlToFiles = new Map();

  for (const rel of files) {
    const abs = path.join(ROOT, rel);
    const text = fs.readFileSync(abs, "utf8");
    for (const u of extractUrls(text)) {
      if (isLocalOrExampleUrl(u)) continue;
      if (!urlToFiles.has(u)) urlToFiles.set(u, new Set());
      urlToFiles.get(u).add(rel);
    }
  }

  const urls = Array.from(urlToFiles.keys()).sort();
  console.log(`Checking ${urls.length} URLs...`);

  const failures = [];
  const warnings = [];
  for (const u of urls) {
    const rule = ruleFor(u);
    const strict = rule?.must === true;
    try {
      if (rule?.probe) {
        const res = await fetchProbe(u, rule.probe);
        const finalUrl = res.url || u;
        if (!rule.probe.okStatus.includes(res.status)) {
          const rec = {
            url: u,
            where: Array.from(urlToFiles.get(u)).slice(0, 5),
            reason: `Probe failed for ${rule.name}: HTTP ${res.status} (final: ${finalUrl})`,
          };
          (strict ? failures : warnings).push(rec);
        }
        continue;
      }

      const { res, body } = await fetchWithFallback(u);
      const ok = res.status >= 200 && res.status < 400;
      const finalUrl = res.url || u;
      const ct = res.headers.get("content-type") ?? "";

      if (!ok) {
        (strict ? failures : warnings).push({
          url: u,
          where: Array.from(urlToFiles.get(u)).slice(0, 5),
          reason: `HTTP ${res.status} (final: ${finalUrl})`,
        });
        continue;
      }

      if (rule?.expectFinal && !rule.expectFinal.test(finalUrl)) {
        (strict ? failures : warnings).push({
          url: u,
          where: Array.from(urlToFiles.get(u)).slice(0, 5),
          reason: `Final URL mismatch for ${rule.name}: ${finalUrl}`,
        });
        continue;
      }

      if (rule?.finalAllow && !rule.finalAllow.some((re) => re.test(finalUrl))) {
        (strict ? failures : warnings).push({
          url: u,
          where: Array.from(urlToFiles.get(u)).slice(0, 5),
          reason: `Final URL mismatch for ${rule.name}: ${finalUrl}`,
        });
        continue;
      }

      if (rule?.contentType && !rule.contentType.test(ct)) {
        (strict ? failures : warnings).push({
          url: u,
          where: Array.from(urlToFiles.get(u)).slice(0, 5),
          reason: `Content-Type mismatch for ${rule.name}: ${ct || "(missing)"}`,
        });
        continue;
      }

      if (rule?.bodyIncludes && body) {
        const missing = rule.bodyIncludes.filter((s) => !body.includes(s));
        if (missing.length > 0) {
          (strict ? failures : warnings).push({
            url: u,
            where: Array.from(urlToFiles.get(u)).slice(0, 5),
            reason: `Content signature mismatch for ${rule.name}: missing ${missing.join(", ")}`,
          });
          continue;
        }
      }
    } catch (err) {
      (strict ? failures : warnings).push({
        url: u,
        where: Array.from(urlToFiles.get(u)).slice(0, 5),
        reason: `Fetch failed: ${err?.message ?? String(err)}`,
      });
    }
  }

  if (failures.length) {
    console.error(`\nFAIL (${failures.length}):`);
    for (const f of failures.slice(0, 60)) {
      console.error(`- ${f.url}`);
      console.error(`  reason: ${f.reason}`);
      console.error(`  found in: ${f.where.join(", ")}`);
    }
    if (failures.length > 60) {
      console.error(`...and ${failures.length - 60} more`);
    }
    process.exit(1);
  }

  if (warnings.length) {
    console.warn(`\nWARN (${warnings.length}):`);
    for (const w of warnings.slice(0, 60)) {
      console.warn(`- ${w.url}`);
      console.warn(`  reason: ${w.reason}`);
      console.warn(`  found in: ${w.where.join(", ")}`);
    }
    if (warnings.length > 60) {
      console.warn(`...and ${warnings.length - 60} more`);
    }
  }

  console.log("OK: all checked links look correct.");
}

main().catch((e) => {
  console.error("fatal:", e);
  process.exit(1);
});

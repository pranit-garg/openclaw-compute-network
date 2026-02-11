#!/usr/bin/env node
/* eslint-disable no-console */

const checks = [
  {
    name: "Landing homepage",
    url: "https://www.dispatch.computer/",
    expectStatus: [200],
    expectBodyIncludes: ["Dispatch"],
  },
  {
    name: "Docs homepage",
    url: "https://docs.dispatch.computer/docs",
    expectStatus: [200],
    expectBodyIncludes: ["Dispatch Docs"],
  },
  {
    name: "Docs search API",
    url: "https://docs.dispatch.computer/api/search?query=solana",
    expectStatus: [200],
    expectJsonArrayLike: true,
  },
  {
    name: "Litepaper raw PDF",
    url: "https://github.com/pranit-garg/Dispatch/raw/main/docs/Dispatch_Litepaper.pdf",
    expectStatusRange: [200, 399],
    expectContentType: /(application\/pdf|application\/octet-stream)/i,
  },
  {
    name: "Solana dApp Store publishing docs",
    url: "https://docs.solanamobile.com/dapp-publishing/intro",
    expectStatusRange: [200, 399],
    expectFinalUrl: /^https:\/\/docs\.solanamobile\.com\/dapp-publishing\/intro\/?$/,
  },
];

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "dispatch-quality-check/1.0",
        accept: "text/html,application/json,*/*",
      },
      ...options,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function looksLikeArrayPayload(payload) {
  if (Array.isArray(payload)) return payload.length >= 0;
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.results)) return true;
    if (Array.isArray(payload.data)) return true;
    if (Array.isArray(payload.items)) return true;
  }
  return false;
}

async function run() {
  const failures = [];

  for (const check of checks) {
    try {
      const res = await fetchWithTimeout(check.url);
      const status = res.status;
      const finalUrl = res.url || check.url;
      const contentType = res.headers.get("content-type") || "";
      const bodyText = await res.text();

      if (check.expectStatus && !check.expectStatus.includes(status)) {
        failures.push(`${check.name}: expected status ${check.expectStatus.join(",")} but got ${status}`);
        continue;
      }

      if (check.expectStatusRange) {
        const [min, max] = check.expectStatusRange;
        if (status < min || status > max) {
          failures.push(`${check.name}: expected status ${min}-${max} but got ${status}`);
          continue;
        }
      }

      if (check.expectFinalUrl && !check.expectFinalUrl.test(finalUrl)) {
        failures.push(`${check.name}: final URL mismatch (${finalUrl})`);
        continue;
      }

      if (check.expectContentType && !check.expectContentType.test(contentType)) {
        failures.push(`${check.name}: unexpected content-type (${contentType || "missing"})`);
        continue;
      }

      if (check.expectBodyIncludes) {
        const missing = check.expectBodyIncludes.filter((needle) => !bodyText.includes(needle));
        if (missing.length > 0) {
          failures.push(`${check.name}: response missing expected markers (${missing.join(", ")})`);
          continue;
        }
      }

      if (check.expectJsonArrayLike) {
        let parsed = null;
        try {
          parsed = JSON.parse(bodyText);
        } catch {
          failures.push(`${check.name}: response is not valid JSON`);
          continue;
        }
        if (!looksLikeArrayPayload(parsed)) {
          failures.push(`${check.name}: JSON payload shape is unexpected`);
          continue;
        }
      }

      console.log(`OK: ${check.name}`);
    } catch (err) {
      failures.push(`${check.name}: request failed (${err?.message ?? String(err)})`);
    }
  }

  if (failures.length > 0) {
    console.error("\nPublic surface verification failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("\nAll public checks passed.");
}

run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

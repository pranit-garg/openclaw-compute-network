import { ComputeRouter } from "@openclaw/compute-router";
import { runScenarios } from "./scenarios.js";

const chain = (process.env.DEMO_CHAIN ?? process.argv.find((a) => a.startsWith("--chain"))?.split("=")[1] ?? "monad") as "monad" | "solana";

async function main() {
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║   OpenClaw CloudBot Demo — ${chain.toUpperCase().padEnd(7)}      ║`);
  console.log(`╚══════════════════════════════════════════╝`);

  const router = new ComputeRouter({
    coordinatorUrls: {
      monad: process.env.COORDINATOR_URL_MONAD ?? "http://localhost:4010",
      solana: process.env.COORDINATOR_URL_SOLANA ?? "http://localhost:4020",
    },
    preferredHosted: (process.env.PREFERRED_HOSTED_PROVIDER as "openai" | "anthropic") ?? "openai",
  });

  console.log(`\nRunning 3 scenarios on ${chain}...`);
  const results = await runScenarios(router, chain);

  // ── Summary ──
  console.log(`\n${"─".repeat(45)}`);
  console.log(`RESULTS:`);
  let allPassed = true;
  for (const r of results) {
    const icon = r.passed ? "PASS" : "FAIL";
    console.log(`  [${icon}] ${r.name}${r.error ? ` — ${r.error}` : ""}`);
    if (!r.passed) allPassed = false;
  }
  console.log(`${"─".repeat(45)}`);

  if (allPassed) {
    console.log(`\nAll scenarios passed.\n`);
    process.exit(0);
  } else {
    console.log(`\nSome scenarios failed. See output above.\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Demo fatal:", err);
  process.exit(1);
});

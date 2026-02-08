/**
 * E2E test: spawn coordinator + workers + run demo CLI.
 * Uses child_process.spawn — no Docker required.
 */
import { spawn, type ChildProcess } from "node:child_process";

const processes: ChildProcess[] = [];
let exitCode = 0;

// Kill all on exit
process.on("exit", () => {
  for (const p of processes) {
    try { p.kill("SIGTERM"); } catch {}
  }
});

// Global 60s timeout
const globalTimeout = setTimeout(() => {
  console.error("\n[E2E] TIMEOUT — killing all processes");
  process.exit(1);
}, 120_000);

async function main() {
  console.log("[E2E] Starting end-to-end test...\n");

  // 1. Start Monad coordinator
  const monad = spawnProcess("Monad Coord", "npx", ["tsx", "apps/coordinator-monad/src/index.ts"]);
  await waitForOutput(monad, "Listening on port", 10_000);

  // 2. Start Solana coordinator
  const solana = spawnProcess("Solana Coord", "npx", ["tsx", "apps/coordinator-solana/src/index.ts"]);
  await waitForOutput(solana, "Listening on port", 10_000);

  // 3. Start desktop worker (connects to Monad)
  const desktop = spawnProcess("Desktop Worker", "npx", ["tsx", "apps/worker-desktop/src/index.ts"], {
    COORDINATOR_URL: "http://localhost:4010",
  });
  await waitForOutput(desktop, "Registered", 10_000);

  // 4. Start seeker simulator (connects to Monad)
  const seeker = spawnProcess("Seeker Sim", "npx", ["tsx", "apps/seeker-simulator/src/index.ts"], {
    COORDINATOR_URL: "http://localhost:4010",
  });
  await waitForOutput(seeker, "Registered", 10_000);

  // 5. Run Monad demo
  console.log("\n[E2E] Running Monad demo...");
  const monadDemo = await runToCompletion("npx", ["tsx", "apps/cloudbot-demo/src/index.ts"], {
    DEMO_CHAIN: "monad",
    COORDINATOR_URL_MONAD: "http://localhost:4010",
    COORDINATOR_URL_SOLANA: "http://localhost:4020",
  });
  if (monadDemo !== 0) {
    console.error("[E2E] Monad demo FAILED");
    exitCode = 1;
  } else {
    console.log("[E2E] Monad demo PASSED");
  }

  // 6. Start workers connected to Solana and run Solana demo
  const desktopSol = spawnProcess("Desktop Worker Sol", "npx", ["tsx", "apps/worker-desktop/src/index.ts"], {
    COORDINATOR_URL: "http://localhost:4020",
    WORKER_KEY_PATH: "./data/worker-key-sol.json",
  });
  await waitForOutput(desktopSol, "Registered", 10_000);

  const seekerSol = spawnProcess("Seeker Sim Sol", "npx", ["tsx", "apps/seeker-simulator/src/index.ts"], {
    COORDINATOR_URL: "http://localhost:4020",
  });
  await waitForOutput(seekerSol, "Registered", 10_000);

  console.log("\n[E2E] Running Solana demo...");
  const solanaDemo = await runToCompletion("npx", ["tsx", "apps/cloudbot-demo/src/index.ts"], {
    DEMO_CHAIN: "solana",
    COORDINATOR_URL_MONAD: "http://localhost:4010",
    COORDINATOR_URL_SOLANA: "http://localhost:4020",
  });
  if (solanaDemo !== 0) {
    console.error("[E2E] Solana demo FAILED");
    exitCode = 1;
  } else {
    console.log("[E2E] Solana demo PASSED");
  }

  // Cleanup
  clearTimeout(globalTimeout);
  console.log("\n[E2E] Cleaning up...");
  for (const p of processes) {
    try { p.kill("SIGTERM"); } catch {}
  }

  // Wait a moment for processes to die
  await new Promise((r) => setTimeout(r, 1000));

  console.log(`\n[E2E] Done. Exit code: ${exitCode}`);
  process.exit(exitCode);
}

function spawnProcess(
  label: string,
  cmd: string,
  args: string[],
  extraEnv?: Record<string, string>
): ChildProcess {
  const p = spawn(cmd, args, {
    cwd: process.cwd(),
    env: { ...process.env, ...extraEnv },
    stdio: ["ignore", "pipe", "pipe"],
  });
  processes.push(p);

  p.stdout?.on("data", (d) => {
    for (const line of d.toString().split("\n").filter(Boolean)) {
      console.log(`  [${label}] ${line}`);
    }
  });
  p.stderr?.on("data", (d) => {
    for (const line of d.toString().split("\n").filter(Boolean)) {
      console.log(`  [${label}] ${line}`);
    }
  });

  return p;
}

function waitForOutput(p: ChildProcess, needle: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for "${needle}"`)), timeoutMs);
    const check = (data: Buffer) => {
      if (data.toString().includes(needle)) {
        clearTimeout(timer);
        resolve();
      }
    };
    p.stdout?.on("data", check);
    p.stderr?.on("data", check);
  });
}

function runToCompletion(
  cmd: string,
  args: string[],
  extraEnv?: Record<string, string>
): Promise<number> {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, {
      cwd: process.cwd(),
      env: { ...process.env, ...extraEnv },
      stdio: ["ignore", "pipe", "pipe"],
    });

    p.stdout?.on("data", (d) => process.stdout.write(d));
    p.stderr?.on("data", (d) => process.stderr.write(d));

    p.on("close", (code) => resolve(code ?? 1));
    p.on("error", () => resolve(1));
  });
}

main().catch((err) => {
  console.error("[E2E] Fatal:", err);
  process.exit(1);
});

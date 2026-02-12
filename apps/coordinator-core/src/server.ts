import express from "express";
import http from "node:http";
import { v4 as uuid } from "uuid";
import type { CoordinatorConfig } from "./config.js";
import { createDb } from "./db.js";
import { WorkerHub, type ERC8004Config, type StakeConfig } from "./ws/workerHub.js";
import type { BoltDistributor } from "./bolt/BoltDistributor.js";
import type { WrappedBoltDistributor } from "./bolt/WrappedBoltDistributor.js";
import { healthRouter } from "./routes/health.js";
import { quoteRouter } from "./routes/quote.js";
import { jobsRouter } from "./routes/jobs.js";
import { trustRouter } from "./routes/trust.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { JobType, Policy, PrivacyClass, type JobAssignMsg } from "@dispatch/protocol";

export interface CoordinatorServer {
  httpServer: http.Server;
  hub: WorkerHub;
  shutdown: () => void;
}

/**
 * Create a coordinator server.
 *
 * The x402 middleware is optional — chain-specific coordinators (monad/solana)
 * pass it in after constructing with their chain's scheme.
 * Without it, commit endpoints work without payment (useful for testing).
 */
export function createServer(
  config: CoordinatorConfig,
  options?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentMiddleware?: any;
    erc8004?: ERC8004Config;
    stakeConfig?: StakeConfig;
    boltDistributor?: BoltDistributor;
    wrappedBoltDistributor?: WrappedBoltDistributor;
  }
): CoordinatorServer {
  const app = express();
  app.use(express.json());

  const db = createDb(config.dbPath);
  const httpServer = http.createServer(app);
  const hub = new WorkerHub(httpServer, db, options?.erc8004, options?.stakeConfig, options?.boltDistributor, options?.wrappedBoltDistributor);

  // Apply x402 payment middleware if provided
  if (options?.paymentMiddleware) {
    app.use(options.paymentMiddleware);
  }

  // Mount routes
  app.use(healthRouter(hub, config.network));
  app.use(quoteRouter(config.network));
  app.use(jobsRouter(db, hub));
  app.use(trustRouter(db));
  app.use(dashboardRouter(db, hub));

  // ── Demo mode ─────────────────────────────────

  const DEMO_PROMPTS: Record<string, string[]> = {
    summarize: [
      "Summarize the latest Solana validator update",
      "Summarize this week's DeFi yield farming trends",
      "Summarize the recent Monad testnet performance report",
      "Summarize key changes in the latest Ethereum EIP proposals",
    ],
    classify: [
      "Classify this transaction: 500 USDC transfer to a new wallet",
      "Classify this network event: validator node went offline for 30 seconds",
      "Classify this user behavior: 12 swaps in 5 minutes across 3 DEXs",
      "Classify this alert: gas prices spiked 400% in the last block",
    ],
    extract_json: [
      "Extract structured data from: The token launched at $0.05, reached $1.20 ATH, current market cap $45M",
      "Extract JSON from: Block 18234567 produced by validator Hx7k...9f2a, 1,247 transactions, 0.3s finality",
      "Extract structured data from: Liquidity pool TVL $12.5M, 24h volume $3.2M, APY 34.5%",
      "Extract JSON from: NFT collection: 10,000 items, floor 2.3 SOL, 45% listed, 12 SOL top sale today",
    ],
  };

  const TASK_TYPES: Array<"summarize" | "classify" | "extract_json"> = [
    "summarize",
    "classify",
    "extract_json",
  ];

  let demoTimer: ReturnType<typeof setTimeout> | null = null;
  let demoActive = false;

  function randomDelay(): number {
    return 8000 + Math.random() * 4000; // 8-12 seconds
  }

  function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]!;
  }

  function demoTick(): void {
    if (!demoActive) return;

    const idleWorkers = hub.getIdleWorkers();
    if (idleWorkers.length > 0) {
      const worker = pickRandom(idleWorkers);
      const taskType = pickRandom(TASK_TYPES);
      const prompt = pickRandom(DEMO_PROMPTS[taskType]!);

      const msg: JobAssignMsg = {
        type: "job_assign",
        job_id: "demo-" + uuid(),
        job_type: JobType.TASK,
        payload: { task_type: taskType, input: prompt },
        policy: Policy.CHEAP,
        privacy_class: PrivacyClass.PUBLIC,
        user_id: "demo-coordinator",
      };

      const sent = hub.injectDemoJob(worker.id, msg);
      if (sent) {
        console.log(`[Demo] Injected ${taskType} job to worker ${worker.id}`);
      }
    }

    demoTimer = setTimeout(demoTick, randomDelay());
  }

  function startDemoMode(): void {
    if (demoActive) return;
    demoActive = true;
    demoTimer = setTimeout(demoTick, randomDelay());
    console.log("[Demo] Demo mode started");
  }

  function stopDemoMode(): void {
    demoActive = false;
    if (demoTimer) {
      clearTimeout(demoTimer);
      demoTimer = null;
    }
    console.log("[Demo] Demo mode stopped");
  }

  // Demo HTTP endpoints
  app.post("/v1/demo/start", (_req, res) => {
    startDemoMode();
    res.json({ status: "started" });
  });

  app.post("/v1/demo/stop", (_req, res) => {
    stopDemoMode();
    res.json({ status: "stopped" });
  });

  app.get("/v1/demo/status", (_req, res) => {
    res.json({ active: demoActive });
  });

  // ── End demo mode ─────────────────────────────

  return {
    httpServer,
    hub,
    shutdown() {
      stopDemoMode();
      hub.shutdown();
      httpServer.close();
      db.close();
    },
  };
}

/** Start listening on the configured port */
export function startServer(config: CoordinatorConfig, server: CoordinatorServer): void {
  server.httpServer.listen(config.port, () => {
    console.log(`[Coordinator] Listening on port ${config.port} (${config.network})`);
    console.log(`[Coordinator] HTTP: http://localhost:${config.port}`);
    console.log(`[Coordinator] WS:   ws://localhost:${config.port}`);

    // Auto-start demo mode if configured
    if (process.env.AUTO_DEMO === "true") {
      console.log("[Coordinator] Auto-demo mode: ENABLED");
      setTimeout(() => {
        // POST to our own demo/start endpoint
        const url = `http://localhost:${config.port}/v1/demo/start`;
        fetch(url, { method: "POST" }).catch((err) => {
          console.error("[Coordinator] Failed to auto-start demo mode:", err);
        });
      }, 5000);
    }
  });
}

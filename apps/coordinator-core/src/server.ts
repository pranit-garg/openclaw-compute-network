import express from "express";
import http from "node:http";
import type { CoordinatorConfig } from "./config.js";
import { createDb } from "./db.js";
import { WorkerHub } from "./ws/workerHub.js";
import { healthRouter } from "./routes/health.js";
import { quoteRouter } from "./routes/quote.js";
import { jobsRouter } from "./routes/jobs.js";
import { trustRouter } from "./routes/trust.js";

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
  }
): CoordinatorServer {
  const app = express();
  app.use(express.json());

  const db = createDb(config.dbPath);
  const httpServer = http.createServer(app);
  const hub = new WorkerHub(httpServer, db);

  // Apply x402 payment middleware if provided
  if (options?.paymentMiddleware) {
    app.use(options.paymentMiddleware);
  }

  // Mount routes
  app.use(healthRouter(hub, config.network));
  app.use(quoteRouter(config.network));
  app.use(jobsRouter(db, hub));
  app.use(trustRouter(db));

  return {
    httpServer,
    hub,
    shutdown() {
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
  });
}

import { Router } from "express";
import type { WorkerHub } from "../ws/workerHub.js";

export function healthRouter(hub: WorkerHub, network: string): Router {
  const router = Router();

  router.get("/v1/health", (_req, res) => {
    res.json({
      status: "ok",
      workers_online: hub.onlineCount,
      network,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}

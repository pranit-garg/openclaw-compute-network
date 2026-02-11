import { createRequire } from "node:module";
import { JobType } from "@dispatch/protocol";
import { loadConfig } from "../../lib/config.js";
import { header, keyValue, printCommandError } from "../../lib/display.js";
import { WorkerRuntime } from "../../lib/worker-runtime.js";
import { mapCapabilities, type WorkerStartOptions } from "../../types.js";

const require = createRequire(import.meta.url);
const pkg = require("../../../package.json") as { version: string };

function formatUptime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export async function handler(opts: WorkerStartOptions): Promise<void> {
  try {
    const config = loadConfig();

    const coordinatorUrl = opts.coordinator ?? config.coordinator.monad;
    const capabilities = opts.capabilities
      ? mapCapabilities(opts.capabilities)
      : config.worker.capabilities;

    const runtime = new WorkerRuntime({
      coordinatorUrl,
      capabilities: capabilities.length > 0 ? capabilities : [JobType.LLM_INFER, JobType.TASK],
      ollamaUrl: opts.ollamaUrl ?? config.worker.ollamaUrl,
      keyPath: opts.keyPath ?? config.worker.keyPath,
      trustPairingCode: opts.trustCode,
      providerType: "DESKTOP",
    });

    let lastJobLine = "none";

    runtime.on("job_complete", (job: { jobType: string; durationMs: number; at: Date }) => {
      lastJobLine = `${job.jobType} (${job.durationMs}ms) at ${new Date(job.at).toLocaleTimeString()}`;
      const stats = runtime.getStats();
      console.error("");
      keyValue(
        "Jobs:",
        `${stats.jobsCompleted} completed | ${stats.jobsFailed} failed | Uptime: ${formatUptime(stats.uptime)}`
      );
      keyValue("Last job:", lastJobLine);
    });

    runtime.on("warning", (message: string) => {
      console.error(`  Warning: ${message}`);
    });

    runtime.on("disconnected", () => {
      console.error("  Worker disconnected.");
      process.exit(0);
    });

    await runtime.start();

    const stats = runtime.getStats();

    header(`Worker v${pkg.version}`);
    keyValue("Public key:", `${stats.pubkeyHex.slice(0, 16)}...`);
    keyValue("Coordinator:", coordinatorUrl);
    keyValue("Status:", `Registered (${stats.workerId ?? "unknown"})`);

    console.error("");
    keyValue(
      "Jobs:",
      `${stats.jobsCompleted} completed | ${stats.jobsFailed} failed | Uptime: ${formatUptime(stats.uptime)}`
    );
    keyValue("Last job:", lastJobLine);

    const shutdown = () => {
      runtime.stop();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    await new Promise<void>(() => {});
  } catch (err) {
    printCommandError(err);
  }
}

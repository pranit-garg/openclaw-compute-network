import { setTimeout as delay } from "node:timers/promises";
import { loadConfig } from "../../lib/config.js";
import { getJobStatus } from "../../lib/coordinator-client.js";
import { createSpinner, printCommandError } from "../../lib/display.js";
import {
  mapChain,
  type AgentStatusOptions,
} from "../../types.js";

function writeHumanStatus(status: Awaited<ReturnType<typeof getJobStatus>>): void {
  process.stdout.write(`Job: ${status.id}\n`);
  process.stdout.write(`Status: ${status.status}\n`);
  if (status.completed_at) process.stdout.write(`Completed: ${status.completed_at}\n`);
  if (status.result !== null && status.result !== undefined) {
    process.stdout.write(`Result: ${JSON.stringify(status.result)}\n`);
  }
  if (status.receipt) {
    process.stdout.write(`Receipt: ${JSON.stringify(status.receipt)}\n`);
  }
}

export async function handler(jobId: string, opts: AgentStatusOptions): Promise<void> {
  const spinner = opts.poll ? createSpinner("Polling job status...").start() : null;

  try {
    const config = loadConfig();
    const chain = mapChain(opts.chain ?? config.agent.defaultChain);
    const coordinator = opts.coordinator ?? config.coordinator[chain];

    let status = await getJobStatus(coordinator, jobId);

    if (opts.poll) {
      while (status.status !== "completed" && status.status !== "failed") {
        spinner!.text = `Job ${jobId} is ${status.status}...`;
        await delay(1000);
        status = await getJobStatus(coordinator, jobId);
      }
      spinner!.succeed(`Job ${jobId} is ${status.status}`);
    }

    if (opts.json) {
      process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
    } else {
      writeHumanStatus(status);
    }
  } catch (err) {
    if (spinner) spinner.fail("Polling failed");
    printCommandError(err);
  }
}

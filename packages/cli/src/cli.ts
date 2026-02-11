#!/usr/bin/env node
import { Command } from "commander";
import { createRequire } from "node:module";
import { setConfigOverride } from "./lib/config.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

const program = new Command()
  .name("dispatch")
  .description("Dispatch DePIN Compute Network CLI")
  .version(pkg.version)
  .option("--config <path>", "Path to config file");

program.hook("preAction", (thisCommand) => {
  const globalOpts = thisCommand.optsWithGlobals() as { config?: string };
  setConfigOverride(globalOpts.config);
});

// Worker commands
const worker = program.command("worker").description("Worker node operations");

worker
  .command("start")
  .description("Start a worker node")
  .option("--coordinator <url>", "Coordinator URL")
  .option("--capabilities <list>", "Capabilities: llm,task")
  .option("--ollama-url <url>", "Ollama base URL")
  .option("--trust-code <code>", "Trust pairing code")
  .option("--key-path <path>", "Path to keypair file")
  .action(async (opts) => {
    const command = await import("./commands/worker/start.js");
    await command.handler(opts);
  });

worker
  .command("status")
  .description("Show worker status")
  .option("--coordinator <url>", "Coordinator URL")
  .option("--pubkey <hex>", "Worker public key")
  .action(async (opts) => {
    const command = await import("./commands/worker/status.js");
    await command.handler(opts);
  });

worker
  .command("register")
  .description("Register worker on ERC-8004")
  .option("--name <name>", "Worker name")
  .option("--endpoint <url>", "Worker endpoint URL")
  .option("--skills <list>", "Comma-separated skills")
  .option("--private-key <hex>", "EVM private key")
  .action(async (opts) => {
    const command = await import("./commands/worker/register.js");
    await command.handler(opts);
  });

// Agent commands
const agent = program.command("agent").description("Submit and manage compute jobs");

agent
  .command("run")
  .description("Submit a compute job")
  .requiredOption("--type <type>", "Job type: llm or task")
  .option("--prompt <text>", "Prompt (for LLM jobs)")
  .option("--input <text>", "Input text (for task jobs)")
  .option("--task-type <type>", "Task type: summarize, classify, extract_json")
  .option("--policy <policy>", "Policy: fast, cheap, auto")
  .option("--privacy <privacy>", "Privacy: public, private")
  .option("--chain <chain>", "Chain: monad, solana")
  .option("--max-tokens <n>", "Max tokens for LLM", parseInt)
  .option("--json", "Output raw JSON")
  .action(async (opts) => {
    const command = await import("./commands/agent/run.js");
    await command.handler(opts);
  });

agent
  .command("status")
  .description("Check job status")
  .argument("<job-id>", "Job ID")
  .option("--coordinator <url>", "Coordinator URL")
  .option("--chain <chain>", "Chain: monad, solana")
  .option("--json", "Output raw JSON")
  .option("--poll", "Poll until completed")
  .action(async (jobId, opts) => {
    const command = await import("./commands/agent/status.js");
    await command.handler(jobId, opts);
  });

agent
  .command("quote")
  .description("Get price quote")
  .requiredOption("--type <type>", "Job type: llm or task")
  .option("--policy <policy>", "Policy: fast, cheap, auto")
  .option("--chain <chain>", "Chain: monad, solana")
  .option("--json", "Output raw JSON")
  .action(async (opts) => {
    const command = await import("./commands/agent/quote.js");
    await command.handler(opts);
  });

// Setup commands
program
  .command("init")
  .description("First-time setup wizard")
  .action(async () => {
    const command = await import("./commands/init.js");
    await command.handler();
  });

program
  .command("version")
  .description("Show version info")
  .action(async () => {
    const command = await import("./commands/version.js");
    await command.handler();
  });

program.parse();

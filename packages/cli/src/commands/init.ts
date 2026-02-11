import crypto from "node:crypto";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stderr as output } from "node:process";
import { JobType, Policy, PrivacyClass } from "@dispatch/protocol";
import { saveConfig } from "../lib/config.js";
import { generateKeypair, saveKeypair } from "../lib/keys.js";
import { header, keyValue, printCommandError } from "../lib/display.js";
import {
  mapCapabilities,
  mapChain,
  mapPolicy,
  type DispatchConfig,
  type DispatchMode,
} from "../types.js";

async function ask(rl: ReturnType<typeof createInterface>, question: string, fallback: string): Promise<string> {
  const response = (await rl.question(`${question} [${fallback}]: `)).trim();
  return response.length > 0 ? response : fallback;
}

export async function handler(): Promise<void> {
  try {
    header("Init");

    const rl = createInterface({ input, output });

    const modeInput = (await ask(rl, "Choose mode (worker / agent / both)", "both")).toLowerCase();
    const mode: DispatchMode =
      modeInput === "worker" || modeInput === "agent" || modeInput === "both"
        ? modeInput
        : "both";

    const monadCoordinator = await ask(rl, "Monad coordinator URL", "http://localhost:4010");
    const solanaCoordinator = await ask(rl, "Solana coordinator URL", "http://localhost:4020");

    let ollamaUrl = "http://localhost:11434";
    let capabilities: JobType[] = [JobType.LLM_INFER, JobType.TASK];

    if (mode === "worker" || mode === "both") {
      ollamaUrl = await ask(rl, "Ollama URL", "http://localhost:11434");
      capabilities = mapCapabilities(await ask(rl, "Capabilities", "LLM_INFER,TASK"));
    }

    let defaultChain: "monad" | "solana" = "monad";
    let defaultPolicy: Policy = Policy.AUTO;

    if (mode === "agent" || mode === "both") {
      defaultChain = mapChain(await ask(rl, "Default chain", "monad"));
      defaultPolicy = mapPolicy(await ask(rl, "Default policy", "auto"));
    }

    rl.close();

    const keyPath = "./data/worker-key.json";
    const keypair = generateKeypair();
    saveKeypair(keyPath, keypair);

    const userId = `cli-${crypto.randomBytes(4).toString("hex")}`;

    const config: DispatchConfig = {
      mode,
      coordinator: {
        monad: monadCoordinator,
        solana: solanaCoordinator,
      },
      worker: {
        keyPath,
        capabilities,
        ollamaUrl,
        providerType: "DESKTOP",
      },
      agent: {
        defaultChain,
        defaultPolicy,
        defaultPrivacy: PrivacyClass.PUBLIC,
        userId,
      },
    };

    const configPath = path.join(process.cwd(), ".dispatchrc");
    saveConfig(config, configPath);

    keyValue("Config", configPath);
    keyValue("Key file", path.resolve(keyPath));
    keyValue("User ID", userId);

    console.error("");
    console.error("  Quick start:");
    console.error("  dispatch worker start");
    console.error("  dispatch agent quote --type llm --policy fast");
    console.error("  dispatch agent run --type llm --prompt \"What is gravity?\" --policy fast");
  } catch (err) {
    printCommandError(err);
  }
}

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { JobType, Policy, PrivacyClass } from "@dispatch/protocol";
import type { DispatchConfig } from "../types.js";
import { ERROR_MESSAGES } from "../types.js";

const CONFIG_FILE = ".dispatchrc";

const DEFAULT_CONFIG: DispatchConfig = {
  mode: "both",
  coordinator: {
    monad: "http://localhost:4010",
    solana: "http://localhost:4020",
  },
  worker: {
    keyPath: "./data/worker-key.json",
    capabilities: [JobType.LLM_INFER, JobType.TASK],
    ollamaUrl: "http://localhost:11434",
    providerType: "DESKTOP",
  },
  agent: {
    defaultChain: "monad",
    defaultPolicy: Policy.AUTO,
    defaultPrivacy: PrivacyClass.PUBLIC,
    userId: "cli-00000000",
  },
};

let overridePath: string | undefined;

export function setConfigOverride(configPath: string | undefined): void {
  overridePath = configPath;
}

function existingPath(candidate: string): string | null {
  const resolved = path.resolve(candidate);
  return fs.existsSync(resolved) ? resolved : null;
}

function resolveConfigPath(explicit?: string): string | null {
  const forced = explicit ?? overridePath;
  if (forced) {
    return existingPath(forced);
  }

  const cwdPath = existingPath(path.join(process.cwd(), CONFIG_FILE));
  if (cwdPath) return cwdPath;

  return existingPath(path.join(os.homedir(), CONFIG_FILE));
}

export function getConfigPath(): string {
  const resolved = resolveConfigPath();
  if (resolved) return resolved;
  return path.join(process.cwd(), CONFIG_FILE);
}

export function mergeDefaults(partial: Partial<DispatchConfig>): DispatchConfig {
  return {
    mode: partial.mode ?? DEFAULT_CONFIG.mode,
    coordinator: {
      monad: partial.coordinator?.monad ?? DEFAULT_CONFIG.coordinator.monad,
      solana: partial.coordinator?.solana ?? DEFAULT_CONFIG.coordinator.solana,
    },
    worker: {
      keyPath: partial.worker?.keyPath ?? DEFAULT_CONFIG.worker.keyPath,
      capabilities: partial.worker?.capabilities ?? DEFAULT_CONFIG.worker.capabilities,
      ollamaUrl: partial.worker?.ollamaUrl ?? DEFAULT_CONFIG.worker.ollamaUrl,
      providerType: partial.worker?.providerType ?? DEFAULT_CONFIG.worker.providerType,
    },
    agent: {
      defaultChain: partial.agent?.defaultChain ?? DEFAULT_CONFIG.agent.defaultChain,
      defaultPolicy: partial.agent?.defaultPolicy ?? DEFAULT_CONFIG.agent.defaultPolicy,
      defaultPrivacy: partial.agent?.defaultPrivacy ?? DEFAULT_CONFIG.agent.defaultPrivacy,
      userId: partial.agent?.userId ?? DEFAULT_CONFIG.agent.userId,
    },
  };
}

export function loadConfig(explicitPath?: string): DispatchConfig {
  const configPath = resolveConfigPath(explicitPath);
  if (!configPath) {
    throw new Error(ERROR_MESSAGES.NO_CONFIG);
  }

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<DispatchConfig>;
    return mergeDefaults(parsed);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${configPath}`);
    }
    throw err;
  }
}

export function saveConfig(config: DispatchConfig, targetPath?: string): void {
  const configPath = path.resolve(targetPath ?? getConfigPath());
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
}

export function getDefaultConfig(): DispatchConfig {
  return mergeDefaults({});
}

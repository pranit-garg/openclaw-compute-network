import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getConfigPath,
  loadConfig,
  mergeDefaults,
  setConfigOverride,
} from "../lib/config.js";
import { ERROR_MESSAGES } from "../types.js";

describe("config", () => {
  let tempRoot: string;
  let cwdDir: string;
  let homeDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "dispatch-cli-config-"));
    cwdDir = path.join(tempRoot, "cwd");
    homeDir = path.join(tempRoot, "home");
    fs.mkdirSync(cwdDir, { recursive: true });
    fs.mkdirSync(homeDir, { recursive: true });

    process.chdir(cwdDir);
    setConfigOverride(undefined);
    vi.spyOn(os, "homedir").mockReturnValue(homeDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    vi.restoreAllMocks();
    setConfigOverride(undefined);
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it("resolves --config override before cwd/home", () => {
    const overridePath = path.join(tempRoot, "custom.dispatchrc");

    fs.writeFileSync(path.join(cwdDir, ".dispatchrc"), JSON.stringify({ mode: "agent" }));
    fs.writeFileSync(path.join(homeDir, ".dispatchrc"), JSON.stringify({ mode: "worker" }));
    fs.writeFileSync(overridePath, JSON.stringify({ mode: "both" }));

    const config = loadConfig(overridePath);
    expect(config.mode).toBe("both");
  });

  it("resolves cwd config before home config", () => {
    fs.writeFileSync(path.join(cwdDir, ".dispatchrc"), JSON.stringify({ mode: "worker" }));
    fs.writeFileSync(path.join(homeDir, ".dispatchrc"), JSON.stringify({ mode: "agent" }));

    const config = loadConfig();
    expect(config.mode).toBe("worker");
    expect(getConfigPath().endsWith(path.join("cwd", ".dispatchrc"))).toBe(true);
  });

  it("resolves home config when cwd is missing", () => {
    fs.writeFileSync(path.join(homeDir, ".dispatchrc"), JSON.stringify({ mode: "agent" }));
    const config = loadConfig();
    expect(config.mode).toBe("agent");
    expect(getConfigPath().endsWith(path.join("home", ".dispatchrc"))).toBe(true);
  });

  it("throws exact error when no config exists", () => {
    expect(() => loadConfig()).toThrow(ERROR_MESSAGES.NO_CONFIG);
  });

  it("throws for invalid json", () => {
    fs.writeFileSync(path.join(cwdDir, ".dispatchrc"), "{bad json");
    expect(() => loadConfig()).toThrow(/Invalid JSON/);
  });

  it("merges defaults for partial config", () => {
    const merged = mergeDefaults({
      coordinator: { monad: "http://example.com", solana: "http://localhost:4020" },
    });

    expect(merged.coordinator.monad).toBe("http://example.com");
    expect(merged.coordinator.solana).toBe("http://localhost:4020");
    expect(merged.worker.providerType).toBe("DESKTOP");
  });
});

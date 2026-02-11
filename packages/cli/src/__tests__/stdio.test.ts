import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@dispatch/compute-router", () => ({
  ComputeRouter: class {
    async runLLM() {
      return {
        output: { text: "Hello from worker", model: "stub-v1" },
        route: "decentralized:monad",
        price: "$0.010",
        latency_ms: 342,
        receipt: {
          job_id: "job-1",
          provider_pubkey: "abcd",
          output_hash: "efgh",
          verified: true,
        },
      };
    }

    async runTask() {
      return {
        output: { summary: "ok" },
        route: "decentralized:monad",
        price: "$0.003",
        latency_ms: 210,
        receipt: null,
      };
    }
  },
}));

vi.mock("../lib/config.js", () => ({
  loadConfig: () => ({
    mode: "both",
    coordinator: {
      monad: "http://localhost:4010",
      solana: "http://localhost:4020",
    },
    worker: {
      keyPath: "./data/worker-key.json",
      capabilities: ["LLM_INFER", "TASK"],
      ollamaUrl: "http://localhost:11434",
      providerType: "DESKTOP",
    },
    agent: {
      defaultChain: "monad",
      defaultPolicy: "AUTO",
      defaultPrivacy: "PUBLIC",
      userId: "cli-test",
    },
  }),
}));

vi.mock("../lib/display.js", () => ({
  createSpinner: () => ({
    text: "",
    start() {
      return this;
    },
    succeed() {
      return this;
    },
    stop() {
      return this;
    },
  }),
  keyValue: (key: string, value: string) => {
    console.error(`${key} ${value}`);
  },
  printCommandError: (err: unknown) => {
    throw err;
  },
}));

describe("stdio behavior", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prints result payload to stdout and UI metadata to stderr", async () => {
    const { handler } = await import("../commands/agent/run.js");

    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const stderrSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await handler({
      type: "llm",
      prompt: "Hello",
      policy: "fast",
      chain: "monad",
    });

    const stdout = stdoutSpy.mock.calls.map((call) => String(call[0])).join("");
    const stderr = stderrSpy.mock.calls.map((call) => call.map((part) => String(part)).join(" ")).join("\n");

    expect(stdout).toContain("Hello from worker");
    expect(stdout).not.toContain("Route:");

    expect(stderr).toContain("Route:");
    expect(stderr).toContain("Price:");
    expect(stderr).toContain("Latency:");
  });
});

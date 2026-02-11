import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JobType } from "@dispatch/protocol";

const sockets: MockWebSocket[] = [];

class MockWebSocket extends EventEmitter {
  static OPEN = 1;
  static CONNECTING = 0;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  sent: string[] = [];

  constructor(public url: string) {
    super();
    sockets.push(this);
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.emit("open");
    }, 0);
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
    this.emit("close");
  }
}

vi.mock("ws", () => ({
  default: MockWebSocket,
}));

vi.mock("../lib/keys.js", () => ({
  loadOrCreateKeypair: () => ({
    publicKey: new Uint8Array(32),
    secretKey: new Uint8Array(64).fill(1),
    pubkeyHex: "a".repeat(64),
  }),
}));

describe("WorkerRuntime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sockets.length = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    sockets.length = 0;
  });

  it("connects, registers, heartbeats, executes job, and stops", async () => {
    const { WorkerRuntime } = await import("../lib/worker-runtime.js");

    const runtime = new WorkerRuntime({
      coordinatorUrl: "http://localhost:4010",
      capabilities: [JobType.LLM_INFER, JobType.TASK],
      ollamaUrl: undefined,
      keyPath: "./data/test-worker-key.json",
      providerType: "DESKTOP",
    });

    const startPromise = runtime.start();
    await vi.advanceTimersByTimeAsync(0);

    const ws = sockets[0]!;
    expect(ws).toBeDefined();
    expect(JSON.parse(ws.sent[0] ?? "{}").type).toBe("register");

    ws.emit(
      "message",
      Buffer.from(JSON.stringify({ type: "register_ack", status: "ok", worker_id: "worker-1" }))
    );

    await startPromise;

    await vi.advanceTimersByTimeAsync(10_000);
    const heartbeatMessage = ws.sent
      .map((value) => JSON.parse(value))
      .find((value) => value.type === "heartbeat");
    expect(heartbeatMessage).toBeDefined();

    ws.emit(
      "message",
      Buffer.from(
        JSON.stringify({
          type: "job_assign",
          job_id: "job-1",
          job_type: "TASK",
          payload: {
            task_type: "summarize",
            input: "Dispatch is a decentralized compute network.",
          },
          policy: "CHEAP",
          privacy_class: "PUBLIC",
          user_id: "cli-123",
        })
      )
    );

    await vi.advanceTimersByTimeAsync(0);

    const jobComplete = ws.sent
      .map((value) => JSON.parse(value))
      .find((value) => value.type === "job_complete");

    expect(jobComplete).toBeDefined();
    expect(jobComplete.receipt).toBeDefined();
    expect(jobComplete.receipt_signature).toBeTypeOf("string");

    const stats = runtime.getStats();
    expect(stats.workerId).toBe("worker-1");
    expect(stats.jobsCompleted + stats.jobsFailed).toBeGreaterThanOrEqual(1);

    runtime.stop();
    expect(runtime.getStats().status).toBe("disconnected");
  });
});

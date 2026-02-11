import { JobType, Policy } from "@dispatch/protocol";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getHealth, getQuote } from "../lib/coordinator-client.js";
import { ERROR_MESSAGES } from "../types.js";

describe("coordinator client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws coordinator unreachable for network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));

    await expect(getHealth("http://localhost:4010")).rejects.toThrow(
      "Cannot reach coordinator at http://localhost:4010. Is it running?"
    );
  });

  it("maps 402 to payment-required message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "payment" }), { status: 402 }))
    );

    await expect(
      getQuote("http://localhost:4010", { jobType: JobType.LLM_INFER, policy: Policy.FAST })
    ).rejects.toThrow(ERROR_MESSAGES.PAYMENT_REQUIRED);
  });

  it("maps 404 to not-found error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "not found" }), { status: 404 }))
    );

    await expect(getHealth("http://localhost:4010")).rejects.toThrow(/not found/i);
  });

  it("maps 422 no_trusted_worker to exact message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "no_trusted_worker" }), { status: 422 })
      )
    );

    await expect(getHealth("http://localhost:4010")).rejects.toThrow(
      ERROR_MESSAGES.NO_TRUSTED_WORKER
    );
  });
});

import { describe, it, expect } from "vitest";
import { Policy, PrivacyClass, resolvePolicy, JobType } from "@openclaw/protocol";

describe("Policy resolution", () => {
  it("AUTO + LLM_INFER → FAST", () => {
    expect(resolvePolicy(Policy.AUTO, JobType.LLM_INFER)).toBe(Policy.FAST);
  });

  it("AUTO + TASK → CHEAP", () => {
    expect(resolvePolicy(Policy.AUTO, JobType.TASK)).toBe(Policy.CHEAP);
  });

  it("FAST stays FAST", () => {
    expect(resolvePolicy(Policy.FAST, JobType.TASK)).toBe(Policy.FAST);
  });

  it("CHEAP stays CHEAP", () => {
    expect(resolvePolicy(Policy.CHEAP, JobType.LLM_INFER)).toBe(Policy.CHEAP);
  });
});

import { JobType, Policy, PrivacyClass } from "@dispatch/protocol";
import { describe, expect, it } from "vitest";
import {
  mapCapabilities,
  mapJobType,
  mapPolicy,
  mapPrivacy,
  mapTaskType,
} from "../types.js";

describe("enum mapping", () => {
  it("maps llm/task to protocol JobType", () => {
    expect(mapJobType("llm")).toBe(JobType.LLM_INFER);
    expect(mapJobType("TASK")).toBe(JobType.TASK);
  });

  it("maps policy values case-insensitively", () => {
    expect(mapPolicy("fast")).toBe(Policy.FAST);
    expect(mapPolicy("CHEAP")).toBe(Policy.CHEAP);
    expect(mapPolicy("AuTo")).toBe(Policy.AUTO);
  });

  it("maps privacy values case-insensitively", () => {
    expect(mapPrivacy("public")).toBe(PrivacyClass.PUBLIC);
    expect(mapPrivacy("PRIVATE")).toBe(PrivacyClass.PRIVATE);
  });

  it("maps task types", () => {
    expect(mapTaskType("summarize")).toBe("summarize");
    expect(mapTaskType("EXTRACT_JSON")).toBe("extract_json");
  });

  it("maps capabilities", () => {
    expect(mapCapabilities("llm,task")).toEqual([JobType.LLM_INFER, JobType.TASK]);
    expect(mapCapabilities("LLM_INFER,TASK")).toEqual([JobType.LLM_INFER, JobType.TASK]);
  });
});

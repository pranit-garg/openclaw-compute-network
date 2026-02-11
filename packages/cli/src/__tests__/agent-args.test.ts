import { describe, expect, it } from "vitest";
import { ERROR_MESSAGES, validateAgentRunArgs } from "../types.js";

describe("agent run argument validation", () => {
  it("requires --prompt for llm jobs", () => {
    expect(() =>
      validateAgentRunArgs({ type: "llm" })
    ).toThrow(ERROR_MESSAGES.PROMPT_REQUIRED);
  });

  it("requires --input for task jobs", () => {
    expect(() =>
      validateAgentRunArgs({ type: "task", taskType: "summarize" })
    ).toThrow(ERROR_MESSAGES.INPUT_REQUIRED);
  });

  it("requires --task-type for task jobs", () => {
    expect(() =>
      validateAgentRunArgs({ type: "task", input: "text" })
    ).toThrow(ERROR_MESSAGES.TASK_TYPE_REQUIRED);
  });

  it("hard-errors when --prompt is used with task", () => {
    expect(() =>
      validateAgentRunArgs({ type: "task", input: "text", prompt: "hi", taskType: "summarize" })
    ).toThrow(ERROR_MESSAGES.PROMPT_FOR_TASK);
  });

  it("hard-errors when --input is used with llm", () => {
    expect(() =>
      validateAgentRunArgs({ type: "llm", prompt: "hi", input: "text" })
    ).toThrow(ERROR_MESSAGES.INPUT_FOR_LLM);
  });
});

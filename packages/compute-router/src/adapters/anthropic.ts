import type { ComputeAdapter, ComputeResult, LLMRequest, TaskRequest } from "./types.js";

/**
 * Hosted adapter using Anthropic API (BYOK).
 * Requires ANTHROPIC_API_KEY env var.
 */
export class AnthropicAdapter implements ComputeAdapter {
  name = "hosted:anthropic";

  async runLLM(req: LLMRequest): Promise<ComputeResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    const start = Date.now();
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: req.max_tokens ?? 256,
      messages: [{ role: "user", content: req.prompt }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    return {
      output: {
        text,
        model: message.model,
        usage: message.usage,
      },
      route: this.name,
      price: null,
      latency_ms: Date.now() - start,
      receipt: null,
    };
  }

  async runTask(req: TaskRequest): Promise<ComputeResult> {
    const taskPrompt = buildTaskPrompt(req.task_type, req.input);
    return this.runLLM({ ...req, prompt: taskPrompt });
  }
}

function buildTaskPrompt(taskType: string, input: string): string {
  switch (taskType) {
    case "summarize":
      return `Summarize the following text concisely:\n\n${input}`;
    case "classify":
      return `Classify the sentiment of the following text as positive, negative, or neutral. Respond with JSON: {"sentiment": "...", "confidence": 0.0-1.0}\n\n${input}`;
    case "extract_json":
      return `Extract all JSON objects from the following text. Respond with a JSON array:\n\n${input}`;
    default:
      return input;
  }
}

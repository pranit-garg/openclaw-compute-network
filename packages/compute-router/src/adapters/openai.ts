import type { ComputeAdapter, ComputeResult, LLMRequest, TaskRequest } from "./types.js";

/**
 * Hosted adapter using OpenAI API (BYOK).
 * Requires OPENAI_API_KEY env var.
 */
export class OpenAIAdapter implements ComputeAdapter {
  name = "hosted:openai";

  async runLLM(req: LLMRequest): Promise<ComputeResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not set");

    const start = Date.now();
    // Dynamic import to avoid requiring the package when not used
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: req.prompt }],
      max_tokens: req.max_tokens ?? 256,
    });

    return {
      output: {
        text: completion.choices[0]?.message?.content ?? "",
        model: completion.model,
        usage: completion.usage,
      },
      route: this.name,
      price: null, // BYOK — user pays OpenAI directly
      latency_ms: Date.now() - start,
      receipt: null,
    };
  }

  async runTask(req: TaskRequest): Promise<ComputeResult> {
    // Use LLM to handle task via prompt engineering
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
      return `Extract all JSON objects from the following text. Respond with a JSON array of the extracted objects:\n\n${input}`;
    default:
      return input;
  }
}

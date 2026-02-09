import type { TaskType } from "@dispatch/protocol";

/**
 * Execute TASK jobs locally:
 * - summarize: first 200 chars + word count
 * - classify: keyword-based sentiment
 * - extract_json: regex extraction of JSON blocks
 */
export function executeTask(taskType: TaskType, input: string): unknown {
  switch (taskType) {
    case "summarize":
      return summarize(input);
    case "classify":
      return classify(input);
    case "extract_json":
      return extractJson(input);
    default:
      return { error: `Unknown task_type: ${taskType as string}` };
  }
}

function summarize(input: string): { summary: string; word_count: number } {
  const words = input.trim().split(/\s+/);
  const truncated = input.length > 200 ? input.slice(0, 200) + "..." : input;
  return { summary: truncated, word_count: words.length };
}

function classify(input: string): { sentiment: "positive" | "negative" | "neutral"; confidence: number } {
  const lower = input.toLowerCase();
  const positiveWords = ["good", "great", "excellent", "amazing", "love", "happy", "best", "wonderful", "fantastic"];
  const negativeWords = ["bad", "terrible", "awful", "hate", "worst", "horrible", "poor", "disappointing", "sad"];

  let score = 0;
  for (const w of positiveWords) if (lower.includes(w)) score++;
  for (const w of negativeWords) if (lower.includes(w)) score--;

  const sentiment = score > 0 ? "positive" : score < 0 ? "negative" : "neutral";
  const confidence = Math.min(1, Math.abs(score) * 0.2 + 0.3);
  return { sentiment, confidence };
}

function extractJson(input: string): { extracted: unknown[]; count: number } {
  const jsonPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  const matches = input.match(jsonPattern) ?? [];
  const parsed: unknown[] = [];

  for (const m of matches) {
    try {
      parsed.push(JSON.parse(m));
    } catch {
      // skip invalid JSON blocks
    }
  }

  return { extracted: parsed, count: parsed.length };
}

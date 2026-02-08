import { ollamaInfer } from "./llm/runners/ollama.js";
import { stubInfer } from "./llm/runners/stub.js";

/**
 * Execute LLM_INFER jobs.
 * Uses Ollama if OLLAMA_BASE_URL is set, otherwise falls back to stub.
 */
export async function executeLLM(
  prompt: string,
  jobId: string,
  maxTokens?: number
): Promise<unknown> {
  if (process.env.OLLAMA_BASE_URL) {
    try {
      return await ollamaInfer(prompt, maxTokens);
    } catch (err) {
      console.warn(`[LLM] Ollama failed, falling back to stub:`, (err as Error).message);
      return stubInfer(prompt, jobId);
    }
  }
  return stubInfer(prompt, jobId);
}

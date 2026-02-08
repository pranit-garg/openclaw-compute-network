/**
 * Stub LLM runner — returns a canned response with job metadata.
 * Used when no Ollama instance is available.
 */
export function stubInfer(prompt: string, jobId: string): { text: string; model: string; stub: boolean } {
  return {
    text: `[STUB] Received prompt (${prompt.length} chars) for job ${jobId}. In production, this would be processed by a local LLM via Ollama or a GPU worker.`,
    model: "stub-v1",
    stub: true,
  };
}

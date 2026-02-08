/**
 * Ollama LLM runner — calls local Ollama HTTP API.
 * Expects OLLAMA_BASE_URL env var (default: http://localhost:11434).
 */
export async function ollamaInfer(
  prompt: string,
  maxTokens: number = 256
): Promise<{ text: string; model: string }> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

  const res = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? "llama3.2",
      prompt,
      stream: false,
      options: { num_predict: maxTokens },
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { response: string; model: string };
  return { text: data.response, model: data.model };
}

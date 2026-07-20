import { AI_MODEL } from "./context";

/**
 * Turns an OpenAI-SDK error into a useful message and logs full diagnostic
 * detail server-side (status, provider error body, base URL, model —
 * never the API key) so failures are debuggable from Vercel function logs
 * without ever exposing secrets.
 */
export function describeAiError(e: unknown, where: string): string {
  const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1 (default)";

  const status = (e as { status?: number })?.status;
  const providerBody = (e as { error?: unknown })?.error;
  const message = e instanceof Error ? e.message : String(e);

  console.error(
    `[ai:${where}] request failed`,
    JSON.stringify({
      status,
      message,
      providerBody,
      baseUrl,
      model: AI_MODEL,
    }),
  );

  if (status === 404) {
    return (
      `The AI provider returned 404 (endpoint or model not found) for model "${AI_MODEL}" ` +
      `at ${baseUrl}. Double-check AI_MODEL matches a model your provider actually serves, ` +
      `and that AI_BASE_URL is the full OpenAI-compatible path (e.g. Gemini needs the ` +
      `trailing "/openai/").`
    );
  }
  if (status === 401 || status === 403) {
    return "The AI provider rejected the key (unauthorized). Double-check AI_API_KEY.";
  }
  if (status === 429) {
    return "The AI provider's rate limit was hit. Wait a moment and try again.";
  }
  if (status === 503) {
    return "The AI provider is overloaded right now. Wait a moment and try again.";
  }

  return message || "AI request failed.";
}

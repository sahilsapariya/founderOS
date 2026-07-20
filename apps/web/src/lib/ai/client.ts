import OpenAI from "openai";

/**
 * Server-only AI client. Works with any OpenAI-compatible provider:
 *  - OpenAI (default):  AI_API_KEY only
 *  - Google Gemini:     AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
 *  - Groq:              AI_BASE_URL=https://api.groq.com/openai/v1
 * Never import from client components.
 */
export function createAIClient() {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "No AI key configured. Set AI_API_KEY (any OpenAI-compatible provider) in apps/web/.env.",
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.AI_BASE_URL || undefined,
  });
}

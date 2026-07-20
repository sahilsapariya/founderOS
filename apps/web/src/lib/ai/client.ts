import OpenAI from "openai";

/**
 * Server-only OpenAI client for the AI module (Daily Brief, suggestions,
 * assistant). Never import this from client components.
 */
export function createAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Copy apps/web/.env.example to .env.local and add your key.",
    );
  }

  return new OpenAI({ apiKey });
}

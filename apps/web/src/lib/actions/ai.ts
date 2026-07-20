"use server";

import { revalidatePath } from "next/cache";

import { createAIClient } from "@/lib/ai/client";
import { AI_MODEL, aiEnabled, buildWorkspaceContext } from "@/lib/ai/context";
import { createClient } from "@/lib/supabase/server";

const NO_KEY_ERROR =
  "OpenAI is not configured yet. Add OPENAI_API_KEY to apps/web/.env (and your Vercel env) to enable AI features.";

export interface AiBriefContent {
  summary: string;
  recommendation: string;
  focus_points: string[];
}

type BriefResult =
  | { ok: true; brief: AiBriefContent }
  | { ok: false; error: string };

export async function generateDailyBrief(): Promise<BriefResult> {
  if (!aiEnabled()) return { ok: false, error: NO_KEY_ERROR };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  try {
    const context = await buildWorkspaceContext();
    const openai = createAIClient();

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "daily_brief",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["summary", "recommendation", "focus_points"],
            properties: {
              summary: {
                type: "string",
                description:
                  "Two sentences max. What today looks like for this founder.",
              },
              recommendation: {
                type: "string",
                description:
                  "One concrete, specific action to prioritize today and why.",
              },
              focus_points: {
                type: "array",
                maxItems: 3,
                items: { type: "string" },
                description: "Up to three short, punchy focus bullets.",
              },
            },
          },
        },
      },
      messages: [
        {
          role: "system",
          content:
            "You are the chief of staff inside FounderOS, a founder's command center. " +
            "Be direct, specific, and concise — reference actual task, project, and event names from the workspace. " +
            "Never invent items that are not in the context.",
        },
        {
          role: "user",
          content: `Prepare my daily brief.\n\nWORKSPACE:\n${context}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return { ok: false, error: "The model returned an empty response." };

    const brief = JSON.parse(raw) as AiBriefContent;

    const { error } = await supabase.from("ai_briefs").upsert(
      {
        user_id: user.id,
        brief_date: new Date().toISOString().slice(0, 10),
        content: JSON.parse(raw),
        model: AI_MODEL,
      },
      { onConflict: "user_id,brief_date" },
    );
    if (error) return { ok: false, error: error.message };

    revalidatePath("/dashboard");
    return { ok: true, brief };
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI generation failed.";
    return { ok: false, error: message };
  }
}

const assistantPrompts: Record<string, string> = {
  "prepare-day":
    "Prepare my day: propose a realistic schedule for today using my calendar gaps, prioritizing overdue and high-priority tasks. Use short time blocks.",
  "weekly-review":
    "Run a weekly review: how are my projects and goals trending, what slipped, and what should change next week?",
  priorities:
    "Suggest my top 5 priorities right now across all projects, ordered, each with a one-line reason.",
  blockers:
    "Identify likely blockers or risks in my workspace (stale tasks, projects without tasks, looming deadlines) and how to unblock each.",
};

type AskResult = { ok: true; answer: string } | { ok: false; error: string };

export async function askAssistant(input: {
  kind?: keyof typeof assistantPrompts | (string & {});
  question?: string;
}): Promise<AskResult> {
  if (!aiEnabled()) return { ok: false, error: NO_KEY_ERROR };

  const prompt =
    (input.kind && assistantPrompts[input.kind]) ||
    input.question?.trim().slice(0, 1000);
  if (!prompt) return { ok: false, error: "Ask something first." };

  try {
    const context = await buildWorkspaceContext();
    const openai = createAIClient();

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are the chief of staff inside FounderOS, a founder's command center. " +
            "Answer using the workspace context. Be direct and practical; use short paragraphs " +
            "and hyphen bullets (no markdown headers, no bold). Reference real item names. " +
            "If the workspace lacks the data to answer, say so plainly.",
        },
        { role: "user", content: `${prompt}\n\nWORKSPACE:\n${context}` },
      ],
    });

    const answer = completion.choices[0]?.message?.content?.trim();
    if (!answer) return { ok: false, error: "The model returned an empty response." };

    return { ok: true, answer };
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI request failed.";
    return { ok: false, error: message };
  }
}

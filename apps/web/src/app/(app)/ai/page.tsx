import type { Metadata } from "next";

import { aiEnabled } from "@/lib/ai/context";
import { AssistantView } from "@/components/ai/assistant-view";

export const metadata: Metadata = { title: "AI Assistant" };

export default function AIPage() {
  return <AssistantView aiEnabled={aiEnabled()} />;
}

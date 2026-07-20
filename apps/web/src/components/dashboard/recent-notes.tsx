import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { FileText, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Database } from "@/lib/database.types";
import { noteKindMeta } from "@/components/notes/note-meta";
import { WidgetCard } from "./widget-card";

type NoteRow = Database["public"]["Tables"]["notes"]["Row"];

export function RecentNotes({ notes }: { notes: NoteRow[] }) {
  return (
    <WidgetCard title="Recent Notes" action="View all" actionHref="/notes">
      {notes.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <FileText className="size-5 text-subtle-foreground" />
          <p className="mt-2 text-[13px] text-muted-foreground">No notes yet</p>
          <Link
            href="/notes?new=1"
            className="mt-2.5 inline-flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1.5 text-xs font-medium text-[#a5b4fc] transition-colors hover:bg-primary/25"
          >
            <Plus className="size-3.5" />
            Write a note
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {notes.map((note) => {
            const meta = noteKindMeta[note.kind] ?? noteKindMeta.quick;
            return (
              <Link
                key={note.id}
                href="/notes"
                className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60"
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-lg",
                    meta.className,
                  )}
                >
                  <meta.icon className="size-3.5" />
                </span>
                <p className="min-w-0 flex-1 truncate text-[13px] font-medium">
                  {note.title}
                </p>
                <span className="shrink-0 text-[11.5px] text-subtle-foreground">
                  {formatDistanceToNowStrict(new Date(note.updated_at))} ago
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}

"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNowStrict } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  Loader2,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Database } from "@/lib/database.types";
import type { ProjectRef } from "@/lib/db-types";
import { createNote, deleteNote, toggleNotePin, updateNote } from "@/lib/actions/notes";
import { noteInputSchema, noteKinds, type NoteInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { noteKindMeta } from "./note-meta";

type NoteRow = Database["public"]["Tables"]["notes"]["Row"];

function NoteFormDialog({
  open,
  onOpenChange,
  note,
  projects,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: NoteRow | null;
  projects: ProjectRef[];
}) {
  const isEdit = Boolean(note);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<NoteInput>({
    resolver: zodResolver(noteInputSchema),
    defaultValues: { title: "", content: "", kind: "quick", project_id: "" },
  });

  React.useEffect(() => {
    if (open) {
      setServerError(null);
      form.reset({
        title: note?.title ?? "",
        content: note?.content ?? "",
        kind: (note?.kind as NoteInput["kind"]) ?? "quick",
        project_id: note?.project_id ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, note]);

  const onSubmit = async (values: NoteInput) => {
    setServerError(null);
    const result = note ? await updateNote(note.id, values) : await createNote(values);
    if (result.ok) onOpenChange(false);
    else setServerError(result.error);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit note" : "New note"}</DialogTitle>
          <DialogDescription>
            Capture ideas, meetings, and decisions. Markdown rendering lands later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              placeholder="e.g. Database schema thoughts"
              autoFocus
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="note-kind">Type</Label>
              <Select id="note-kind" {...form.register("kind")}>
                {noteKinds.map((k) => (
                  <option key={k} value={k}>
                    {noteKindMeta[k].label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="note-project">Project</Label>
              <Select id="note-project" {...form.register("project_id")}>
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note-content">Content</Label>
            <Textarea
              id="note-content"
              rows={8}
              placeholder="Write it down before it escapes…"
              {...form.register("content")}
            />
          </div>
          {serverError && (
            <p className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {serverError}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              {isEdit ? "Save changes" : "Create note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NotesView({
  notes,
  projects,
}: {
  notes: NoteRow[];
  projects: ProjectRef[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<NoteRow | null>(null);
  const [deleting, setDeleting] = React.useState<NoteRow | null>(null);

  React.useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null);
      setFormOpen(true);
      router.replace("/notes");
    }
  }, [searchParams, router]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? notes.filter(
          (n) =>
            n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
        )
      : notes;
    return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [notes, query]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="pl-9"
          />
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          New Note
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-16 text-center">
          <div className="grid size-14 place-items-center rounded-2xl border border-primary/25 bg-primary/10">
            <FileText className="size-6 text-[#a5b4fc]" />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight">
            {query ? "No notes match your search" : "Write your first note"}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {query
              ? "Try a different keyword."
              : "Quick notes, meeting notes, ideas, and decision logs — all in one place."}
          </p>
          {!query && (
            <Button className="mt-5" size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              New Note
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((note) => {
            const meta = noteKindMeta[note.kind] ?? noteKindMeta.quick;
            const project = projects.find((p) => p.id === note.project_id);
            return (
              <Card
                key={note.id}
                className="group flex cursor-pointer flex-col gap-3 p-5 transition-all hover:border-border-strong hover:bg-card-elevated"
                onClick={() => {
                  setEditing(note);
                  setFormOpen(true);
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-lg",
                      meta.className,
                    )}
                  >
                    <meta.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-[14px] font-semibold tracking-tight">
                      {note.pinned && <Pin className="size-3 shrink-0 text-[#a5b4fc]" />}
                      <span className="truncate">{note.title}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-subtle-foreground">
                      {meta.label}
                      {project ? ` · ${project.name}` : ""}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                      >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Note actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem
                        onSelect={() => {
                          setEditing(note);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => toggleNotePin(note.id, !note.pinned)}
                      >
                        {note.pinned ? <PinOff /> : <Pin />}
                        {note.pinned ? "Unpin" : "Pin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setDeleting(note)}
                      >
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {note.content && (
                  <p className="line-clamp-3 text-[12.5px] leading-relaxed text-muted-foreground">
                    {note.content}
                  </p>
                )}

                <p className="mt-auto text-[11px] text-subtle-foreground">
                  Updated {formatDistanceToNowStrict(new Date(note.updated_at))} ago
                </p>
              </Card>
            );
          })}
        </div>
      )}

      <NoteFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        note={editing}
        projects={projects}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete “${deleting?.title}”?`}
        description="This permanently removes the note."
        onConfirm={async () => {
          if (deleting) await deleteNote(deleting.id);
        }}
      />
    </div>
  );
}

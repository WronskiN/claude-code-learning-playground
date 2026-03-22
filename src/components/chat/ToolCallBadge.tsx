"use client";

import { Loader2 } from "lucide-react";

interface StrReplaceArgs {
  command: "view" | "create" | "str_replace" | "insert" | "undo_edit";
  path: string;
}

interface FileManagerArgs {
  command: "rename" | "delete";
  path: string;
  new_path?: string;
}

type ToolArgs = StrReplaceArgs | FileManagerArgs;

interface ToolCallBadgeProps {
  toolName: string;
  args: ToolArgs;
  state: "call" | "partial-call" | "result";
}

function basename(path: string) {
  return path.split("/").filter(Boolean).pop() ?? path;
}

function getLabel(toolName: string, args: ToolArgs): string {
  if (toolName === "str_replace_editor") {
    const { command, path } = args as StrReplaceArgs;
    const name = basename(path);
    switch (command) {
      case "create":
        return `Creating ${name}`;
      case "str_replace":
      case "insert":
        return `Editing ${name}`;
      case "view":
        return `Reading ${name}`;
      default:
        return `Editing ${name}`;
    }
  }

  if (toolName === "file_manager") {
    const { command, path, new_path } = args as FileManagerArgs;
    const name = basename(path);
    if (command === "rename" && new_path) {
      return `Renaming ${name} to ${basename(new_path)}`;
    }
    if (command === "delete") {
      return `Deleting ${name}`;
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolName, args, state }: ToolCallBadgeProps) {
  const label = getLabel(toolName, args);
  const done = state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 shrink-0" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}

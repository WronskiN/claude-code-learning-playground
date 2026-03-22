# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe UI components in a chat interface, Claude generates the code using tool calls, and the result renders instantly in an isolated iframe.

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (all tests)
npm run setup        # First-time setup: install + Prisma generate + migrate
npm run db:reset     # Reset database (destructive)
```

Run a single test file:
```bash
npx vitest src/components/chat/__tests__/MessageList.test.tsx
```

Environment: set `ANTHROPIC_API_KEY` in `.env.local`. Without it, a mock provider returns static demo components.

## Architecture

### Three-Panel UI

`main-content.tsx` renders:
- **Left (35%):** `ChatInterface` — chat history + input
- **Right (65%):** switchable between `PreviewFrame` (live iframe) and `FileTree` + `CodeEditor`

### Chat → Code → Preview Data Flow

1. User sends message → `ChatContext` (`/lib/contexts/chat-context.tsx`) POSTs to `/api/chat`
2. `/api/chat/route.ts` calls Claude with tool definitions and a serialized snapshot of the virtual file system
3. Claude streams text and tool calls (`str_replace_editor`, `file_manager`)
4. `FileSystemContext` (`/lib/contexts/file-system-context.tsx`) processes tool calls and mutates the in-memory `VirtualFileSystem`
5. `PreviewFrame` detects file changes, transforms JSX via Babel standalone (`/lib/transform/jsx-transformer.ts`), and re-renders in a sandboxed iframe
6. On completion, authenticated users' projects are saved to SQLite via Prisma

### Virtual File System

`/lib/file-system.ts` — all files live in memory as a `Map<string, string>`. No disk writes. Serialized to JSON for database persistence and sent to the LLM on each turn as context.

### AI Tools

Defined in `/lib/tools/`:
- `str_replace_editor` — view, create, str_replace, insert operations on the VFS
- `file_manager` — rename and delete operations

The system prompt is in `/lib/prompts/generation.tsx`.

### Preview Rendering

`/lib/transform/jsx-transformer.ts` uses Babel standalone (browser-side) to:
- Transform JSX/TSX to JS
- Build an import map resolving local file references to blob URLs
- Handle CSS imports and missing imports

`PreviewFrame` finds the entry point (`/App.jsx`, `/App.tsx`, `/index.jsx`, etc.), generates an HTML document, and injects it into an iframe.

### Authentication

JWT sessions (7-day, httpOnly cookie) via `/lib/auth.ts`. Server actions in `/actions/` handle sign-up, sign-in, sign-out, and project CRUD. Anonymous users can use the tool without accounts; projects only persist for authenticated users.

### LLM Provider

`/lib/provider.ts` — uses `claude-haiku-4-5` via `@ai-sdk/anthropic`. Falls back to `MockLanguageModel` if no API key is present (returns static component demos based on prompt keywords).

## Key Files

| File | Purpose |
|------|---------|
| `src/app/api/chat/route.ts` | Streaming chat endpoint, orchestrates AI + tool calls |
| `src/lib/contexts/file-system-context.tsx` | Tool call handler, VFS mutations, preview triggers |
| `src/lib/contexts/chat-context.tsx` | Chat state, API integration, project saving |
| `src/lib/file-system.ts` | VirtualFileSystem class |
| `src/lib/transform/jsx-transformer.ts` | Babel JSX transform + import map |
| `src/components/preview/PreviewFrame.tsx` | iframe renderer |
| `prisma/schema.prisma` | SQLite schema: User + Project |

## Code Style

Use comments sparingly. Only comment complex code.

## Tech Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma/SQLite · Vercel AI SDK · Monaco Editor · shadcn/ui · Vitest

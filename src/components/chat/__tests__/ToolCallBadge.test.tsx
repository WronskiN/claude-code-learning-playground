import { test, expect, describe, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

describe("str_replace_editor", () => {
  test("shows 'Creating' for create command", () => {
    render(
      <ToolCallBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/src/Button.tsx" }}
        state="call"
      />
    );
    screen.getByText("Creating Button.tsx");
  });

  test("shows 'Editing' for str_replace command", () => {
    render(
      <ToolCallBadge
        toolName="str_replace_editor"
        args={{ command: "str_replace", path: "/src/App.tsx" }}
        state="call"
      />
    );
    screen.getByText("Editing App.tsx");
  });

  test("shows 'Editing' for insert command", () => {
    render(
      <ToolCallBadge
        toolName="str_replace_editor"
        args={{ command: "insert", path: "/src/App.tsx" }}
        state="result"
      />
    );
    screen.getByText("Editing App.tsx");
  });

  test("shows 'Reading' for view command", () => {
    render(
      <ToolCallBadge
        toolName="str_replace_editor"
        args={{ command: "view", path: "/src/utils.ts" }}
        state="call"
      />
    );
    screen.getByText("Reading utils.ts");
  });

  test("uses only filename, not full path", () => {
    render(
      <ToolCallBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/deeply/nested/dir/Card.tsx" }}
        state="call"
      />
    );
    screen.getByText("Creating Card.tsx");
  });
});

describe("file_manager", () => {
  test("shows 'Renaming' with old and new filename", () => {
    render(
      <ToolCallBadge
        toolName="file_manager"
        args={{ command: "rename", path: "/src/Old.tsx", new_path: "/src/New.tsx" }}
        state="result"
      />
    );
    screen.getByText("Renaming Old.tsx to New.tsx");
  });

  test("shows 'Deleting' for delete command", () => {
    render(
      <ToolCallBadge
        toolName="file_manager"
        args={{ command: "delete", path: "/src/Unused.tsx" }}
        state="call"
      />
    );
    screen.getByText("Deleting Unused.tsx");
  });
});

describe("state indicators", () => {
  test("shows spinner when state is 'call'", () => {
    const { container } = render(
      <ToolCallBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.tsx" }}
        state="call"
      />
    );
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  test("shows green dot when state is 'result'", () => {
    const { container } = render(
      <ToolCallBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.tsx" }}
        state="result"
      />
    );
    expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
    expect(container.querySelector(".animate-spin")).toBeNull();
  });
});

describe("unknown tool fallback", () => {
  test("falls back to toolName for unknown tools", () => {
    render(
      <ToolCallBadge
        toolName="some_unknown_tool"
        args={{ command: "create", path: "/foo.ts" } as any}
        state="call"
      />
    );
    screen.getByText("some_unknown_tool");
  });
});

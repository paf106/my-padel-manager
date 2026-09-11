import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

function collectPages(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory()
      ? collectPages(path)
      : path.endsWith("page.tsx")
        ? [path]
        : [];
  });
}

describe("server component guard", () => {
  it("does not put DOM event handlers in server pages", () => {
    const pages = collectPages(join(process.cwd(), "app"));
    const violations = pages.flatMap((page) => {
      const source = readFileSync(page, "utf8");
      if (source.includes('"use client"') || source.includes("'use client'")) return [];
      return /on(Change|Click|Submit|Input|KeyDown)=/.test(source)
        ? [relative(process.cwd(), page)]
        : [];
    });
    expect(violations).toEqual([]);
  });
});

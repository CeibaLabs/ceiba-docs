import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import GithubSlugger from "github-slugger";
import type { DocEntry } from "@/lib/docs-navigation";

export type DocSection = {
  id: string;
  title: string;
};

const HEADING_PATTERN = /^##\s+(.+?)\s*$/gm;

// Mirrors what rehype-slug actually IDs headings with at render time (it
// slugifies the heading's rendered text, not its raw markdown source) so a
// heading with inline `code` or **bold** still produces a matching anchor.
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

// Derives sidebar sub-items directly from a doc's real H2 headings instead
// of a hand-maintained list, using the same slug algorithm (github-slugger)
// that rehype-slug uses to ID headings when the markdown actually renders -
// so the anchors this produces are guaranteed to match, not just likely to.
export async function getDocSections(doc: DocEntry): Promise<DocSection[]> {
  const raw = await readFile(
    path.join(process.cwd(), "docs", doc.sourceFile),
    "utf8",
  );

  const slugger = new GithubSlugger();
  const sections: DocSection[] = [];

  for (const match of raw.matchAll(HEADING_PATTERN)) {
    const title = stripInlineMarkdown(match[1]);
    sections.push({ id: slugger.slug(title), title });
  }

  return sections;
}

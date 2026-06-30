import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { findDoc } from "@/lib/docs-navigation";

export async function getDocContent(slug: string) {
  const doc = findDoc(slug);

  if (!doc) {
    return null;
  }

  const content = await readFile(
    path.join(process.cwd(), "docs", doc.sourceFile),
    "utf8",
  );

  return { doc, content };
}

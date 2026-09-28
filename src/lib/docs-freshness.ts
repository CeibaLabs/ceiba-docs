import "server-only";

import { statSync } from "node:fs";
import path from "node:path";
import type { DocEntry } from "@/lib/docs-navigation";

/**
 * Last-modified date for a doc, taken from its markdown file on disk.
 *
 * Read at build time. A shallow git clone would give every file the checkout
 * date, which is still better than the build date we had before, but CI does a
 * full clone so these are the real edit times.
 */
export function docLastModified(doc: DocEntry): Date | undefined {
  try {
    return statSync(path.join(process.cwd(), "docs", doc.sourceFile)).mtime;
  } catch {
    return undefined;
  }
}

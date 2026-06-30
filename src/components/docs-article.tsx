import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";
import { adjacentDocs, type DocEntry } from "@/lib/docs-navigation";

export function DocsArticle({
  doc,
  content,
}: {
  doc: DocEntry;
  content: string;
}) {
  const { previous, next } = adjacentDocs(doc);

  return (
    <article className="min-w-0">
      <p className="mb-4 text-xs font-medium text-primary">{doc.group}</p>
      <MarkdownContent>{content}</MarkdownContent>

      <nav
        className="mt-14 grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
        aria-label="Article pagination"
      >
        {previous ? (
          <Link
            href={previous.href}
            className="group flex min-h-20 items-center gap-3 rounded-lg border border-border bg-card p-4 text-foreground no-underline hover:border-primary/35 hover:bg-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
            <span>
              <span className="block text-xs text-muted-foreground">
                Previous
              </span>
              <span className="mt-1 block text-sm font-medium">
                {previous.shortTitle}
              </span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={next.href}
            className="group flex min-h-20 items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 text-right text-foreground no-underline hover:border-primary/35 hover:bg-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="ml-auto">
              <span className="block text-xs text-muted-foreground">Next</span>
              <span className="mt-1 block text-sm font-medium">
                {next.shortTitle}
              </span>
            </span>
            <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
          </Link>
        ) : null}
      </nav>
    </article>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Code2, ExternalLink } from "lucide-react";
import { MobileNavigation } from "@/components/mobile-navigation";
import type { DocSection } from "@/lib/docs-sections";
import { siteLinks } from "@/lib/site-links";

export function SiteHeader({
  sectionsBySlug,
}: {
  sectionsBySlug: Record<string, DocSection[]>;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-3 px-4 sm:px-6">
        <MobileNavigation sectionsBySlug={sectionsBySlug} />
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-foreground no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Image
            src="/ceiba-logo.png"
            alt=""
            width={36}
            height={36}
            priority
            className="size-9 shrink-0"
          />
          <span className="truncate font-display text-base font-semibold">
            Ceiba <span className="text-muted-foreground">Docs</span>
          </span>
        </Link>

        <nav
          className="ml-auto flex items-center gap-1 sm:gap-2"
          aria-label="External links"
        >
          <a
            href={siteLinks.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground no-underline hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Ceiba SDK on GitHub"
            title="GitHub"
          >
            <Code2 aria-hidden="true" className="size-4.5" />
          </a>
          <a
            href={siteLinks.app}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground no-underline hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Login
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}

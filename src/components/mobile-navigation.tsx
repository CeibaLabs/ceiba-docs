"use client";

import Image from "next/image";
import { ExternalLink, Menu } from "lucide-react";
import { useState } from "react";
import { DocsNavigation } from "@/components/docs-navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { DocSection } from "@/lib/docs-sections";
import { siteLinks } from "@/lib/site-links";

export function MobileNavigation({
  sectionsBySlug,
}: {
  sectionsBySlug: Record<string, DocSection[]>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden"
          aria-label="Open documentation navigation"
          title="Open navigation"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent aria-describedby="mobile-navigation-description">
        <div className="border-b border-border px-5 py-4 pr-14">
          <div className="flex items-center gap-2.5">
            <Image
              src="/ceiba-logo.png"
              alt=""
              width={34}
              height={34}
              className="size-8"
            />
            <SheetTitle className="font-display text-base font-semibold">
              Ceiba Docs
            </SheetTitle>
          </div>
          <SheetDescription
            id="mobile-navigation-description"
            className="mt-2 text-xs leading-5 text-muted-foreground"
          >
            Navigate the shipped MVP guides.
          </SheetDescription>
        </div>
        <div className="h-[calc(100svh-8.75rem)] overflow-y-auto px-3 py-5">
          <DocsNavigation
            idPrefix="mobile"
            onNavigate={() => setOpen(false)}
            sectionsBySlug={sectionsBySlug}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 border-t border-border bg-background p-3">
          <a
            href={siteLinks.app}
            className="flex min-h-10 items-center justify-between rounded-lg px-3 text-sm font-medium text-foreground no-underline hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Login
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}

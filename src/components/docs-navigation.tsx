"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  ChevronRight,
  KeyRound,
  LayoutGrid,
  Package,
  RefreshCw,
  Rocket,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useEffect, useState } from "react";
import { navigationGroups, type DocEntry } from "@/lib/docs-navigation";
import type { DocSection } from "@/lib/docs-sections";
import { cn } from "@/lib/utils";

const icons: Record<
  string,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  "/": LayoutGrid,
  "/quickstart": Rocket,
  "/control-plane-operator-guide": BookOpenText,
  "/project-secret-rotation": RefreshCw,
  "/programmatic-api-keys": KeyRound,
  "/sdks": Package,
};

export function DocsNavigation({
  idPrefix = "desktop",
  onNavigate,
  sectionsBySlug,
}: {
  idPrefix?: string;
  onNavigate?: () => void;
  sectionsBySlug: Record<string, DocSection[]>;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation">
      <div className="grid gap-7">
        {navigationGroups.map((group) => {
          const groupId = `${idPrefix}-nav-${group.label.toLowerCase().replaceAll(" ", "-")}`;

          return (
            <section key={group.label} aria-labelledby={groupId}>
              <h2
                id={groupId}
                className="mb-2 px-3 text-xs font-medium text-muted-foreground"
              >
                {group.label}
              </h2>
              <ul className="m-0 grid list-none gap-1 p-0">
                {group.items.map((item) => (
                  <DocsNavItem
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                    onNavigate={onNavigate}
                    sections={sectionsBySlug[item.slug] ?? []}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </nav>
  );
}

function DocsNavItem({
  item,
  isActive,
  onNavigate,
  sections,
}: {
  item: DocEntry;
  isActive: boolean;
  onNavigate?: () => void;
  sections: DocSection[];
}) {
  const [expanded, setExpanded] = useState(isActive);
  // The sidebar persists across client-side navigation (it doesn't remount
  // per page), so seeding state from `isActive` above only auto-expands on
  // a fresh page load. Re-sync whenever this item's page actually becomes
  // active - e.g. clicking the link from elsewhere in the site - without
  // fighting a manual collapse made while already on the page.
  useEffect(() => {
    if (isActive) {
      setExpanded(true);
    }
  }, [isActive]);
  const Icon = icons[item.href];
  const hasSections = sections.length > 0;
  const subNavId = hasSections ? `${item.slug || "home"}-subnav` : undefined;

  return (
    <li>
      <div className="flex items-center gap-0.5">
        <Link
          href={item.href}
          aria-current={isActive ? "page" : undefined}
          onClick={onNavigate}
          className={cn(
            "flex min-h-9 min-w-0 flex-1 items-center gap-2.5 rounded-md border-l-2 py-1.5 pr-3 pl-2.5 text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isActive
              ? "border-primary bg-accent/60 font-medium text-foreground"
              : "border-transparent font-normal text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">{item.shortTitle}</span>
        </Link>
        {hasSections ? (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={subNavId}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${item.shortTitle} sections`}
            onClick={() => setExpanded((value) => !value)}
            className="docs-nav-toggle flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            data-expanded={expanded}
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>
      {hasSections ? (
        <div className="docs-nav-subnav" data-expanded={expanded}>
          <div className="docs-nav-subnav__inner">
            <ul id={subNavId} className="m-0 grid list-none gap-0.5 py-1 pl-8 pr-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <Link
                    href={`${item.href}#${section.id}`}
                    onClick={onNavigate}
                    className="block rounded-md px-3 py-1.5 text-sm leading-snug text-muted-foreground no-underline hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {section.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </li>
  );
}

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
      {/*
        One control, not two. The row used to be a Link plus a separate
        chevron button, so the title navigated and only the small chevron
        toggled - two hit targets doing different things in one visual row.
        Now the whole row is a single Link that navigates *and* opens its
        sections; the chevron is a state indicator inside it, not a control.
        Clicking the row while already on that page toggles instead, so
        collapsing is still possible without a second target.
      */}
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        aria-expanded={hasSections ? expanded : undefined}
        aria-controls={subNavId}
        onClick={(event) => {
          if (hasSections) {
            // Already here: nothing to navigate to, so the click is a toggle.
            // Otherwise always open - arriving at a page with its sections
            // collapsed would hide the thing the click was asking for.
            if (isActive) {
              event.preventDefault();
              setExpanded((value) => !value);
            } else {
              setExpanded(true);
            }
          }
          onNavigate?.();
        }}
        className={cn(
          "flex min-h-9 min-w-0 items-center gap-2.5 rounded-md border-l-2 py-1.5 pr-2 pl-2.5 text-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isActive
            ? "border-primary bg-accent/60 font-medium text-foreground"
            : "border-transparent font-normal text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{item.shortTitle}</span>
        {hasSections ? (
          <ChevronRight
            aria-hidden="true"
            className="docs-nav-toggle size-4 shrink-0 opacity-70"
            data-expanded={expanded}
          />
        ) : null}
      </Link>
      {hasSections ? (
        <div className="docs-nav-subnav" data-expanded={expanded}>
          <div className="docs-nav-subnav__inner">
            <ul id={subNavId} className="docs-nav-tree m-0 grid list-none gap-0.5 py-1 pr-1">
              {sections.map((section) => (
                <li key={section.id} className="docs-nav-tree__item">
                  <Link
                    href={`${item.href}#${section.id}`}
                    onClick={onNavigate}
                    className="block rounded-md px-2 py-1.5 text-sm leading-snug text-muted-foreground no-underline hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

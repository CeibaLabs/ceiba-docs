"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  KeyRound,
  LayoutGrid,
  RefreshCw,
  Rocket,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { navigationGroups } from "@/lib/docs-navigation";
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
};

export function DocsNavigation({
  idPrefix = "desktop",
  onNavigate,
}: {
  idPrefix?: string;
  onNavigate?: () => void;
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
                {group.items.map((item) => {
                  const Icon = icons[item.href];
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        onClick={onNavigate}
                        className={cn(
                          "flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon aria-hidden="true" className="size-4 shrink-0" />
                        <span>{item.shortTitle}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </nav>
  );
}

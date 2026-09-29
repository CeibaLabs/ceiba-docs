export type DocEntry = {
  slug: string;
  href: string;
  sourceFile: string;
  title: string;
  shortTitle: string;
  description: string;
  group: "Getting Started" | "Guides" | "Control Plane" | "SDK And Runtime";
  // Opt-in: when true, the sidebar shows this doc's real H2 headings as
  // expandable sub-items (see docs-sections.ts). Most docs don't need this;
  // it's a per-entry flag rather than special-casing one page by slug/href
  // inside the navigation component itself.
  showSectionNav?: boolean;
};

export const docs: DocEntry[] = [
  {
    slug: "",
    href: "/",
    sourceFile: "index.md",
    title: "Ceiba Documentation",
    shortTitle: "Overview",
    description:
      "Choose the shortest path to protect a Node API, operate a Ceiba project, or manage API keys.",
    group: "Getting Started",
  },
  {
    slug: "quickstart",
    href: "/quickstart",
    sourceFile: "quickstart.md",
    title: "Quickstart",
    shortTitle: "Quickstart",
    description:
      "Protect an Express or Fastify route with the Ceiba Node SDK and Runtime.",
    group: "Getting Started",
  },
  {
    slug: "api-access-control-express",
    href: "/api-access-control-express",
    sourceFile: "api-access-control-express.md",
    title: "API Access Control In Express",
    shortTitle: "Access Control In Express",
    description:
      "Decide who may call which routes of an existing Express API, how much, and what happens when they exceed it.",
    group: "Guides",
    showSectionNav: true,
  },
  {
    slug: "plans-quotas-rate-limits",
    href: "/plans-quotas-rate-limits",
    sourceFile: "plans-quotas-rate-limits.md",
    title: "Plans, Quotas And Rate Limits",
    shortTitle: "Plans And Quotas",
    description:
      "Put a ceiling on API consumption, tie it to what a customer pays for, and have it hold under concurrency.",
    group: "Guides",
    showSectionNav: true,
  },
  {
    slug: "api-key-lifecycle",
    href: "/api-key-lifecycle",
    sourceFile: "api-key-lifecycle.md",
    title: "API Key Lifecycle",
    shortTitle: "API Key Lifecycle",
    description:
      "How API keys should be stored, handed over, retired, and rotated, and what to do the moment one leaks.",
    group: "Guides",
    showSectionNav: true,
  },
  {
    slug: "control-plane-operator-guide",
    href: "/control-plane-operator-guide",
    sourceFile: "control-plane-operator-guide.md",
    title: "Control Plane Operator Guide",
    shortTitle: "Operator Guide",
    description:
      "Create and operate owner-scoped projects, credentials, policies, subscriptions, and usage.",
    group: "Control Plane",
    showSectionNav: true,
  },
  {
    slug: "project-secret-rotation",
    href: "/project-secret-rotation",
    sourceFile: "project-secret-rotation.md",
    title: "Project Secret Rotation",
    shortTitle: "Project Secret Rotation",
    description:
      "Understand one-time project secrets, the fixed 24-hour overlap, and second-rotation behavior.",
    group: "Control Plane",
  },
  {
    slug: "programmatic-api-keys",
    href: "/programmatic-api-keys",
    sourceFile: "programmatic-api-keys.md",
    title: "Programmatic API Keys",
    shortTitle: "Programmatic API Keys",
    description:
      "Create, read, list, expire, revoke, and archive API keys through Runtime and the Node SDK.",
    group: "SDK And Runtime",
  },
  {
    slug: "sdks",
    href: "/sdks",
    sourceFile: "sdks.md",
    title: "SDKs",
    shortTitle: "SDKs",
    description:
      "Current SDK version, supported Node, Express and Fastify ranges, and which SDKs are planned.",
    group: "SDK And Runtime",
  },
  {
    slug: "service-health",
    href: "/service-health",
    sourceFile: "service-health.md",
    title: "Service Health",
    shortTitle: "Service Health",
    description:
      "Public status page, liveness and readiness endpoints, and the deployed build each service reports.",
    group: "SDK And Runtime",
  },
];

export const navigationGroups = [
  {
    label: "Getting Started",
    items: docs.filter((doc) => doc.group === "Getting Started"),
  },
  {
    label: "Guides",
    items: docs.filter((doc) => doc.group === "Guides"),
  },
  {
    label: "Control Plane",
    items: docs.filter((doc) => doc.group === "Control Plane"),
  },
  {
    label: "SDK And Runtime",
    items: docs.filter((doc) => doc.group === "SDK And Runtime"),
  },
] as const;

export function findDoc(slug: string): DocEntry | undefined {
  return docs.find((doc) => doc.slug === slug);
}

export function adjacentDocs(doc: DocEntry) {
  const index = docs.findIndex((entry) => entry.slug === doc.slug);

  return {
    previous: index > 0 ? docs[index - 1] : null,
    next: index >= 0 && index < docs.length - 1 ? docs[index + 1] : null,
  };
}

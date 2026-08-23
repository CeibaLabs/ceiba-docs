export type DocEntry = {
  slug: string;
  href: string;
  sourceFile: string;
  title: string;
  shortTitle: string;
  description: string;
  group: "Getting Started" | "Control Plane" | "SDK And Runtime";
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
      "The Node SDK is published today. Python and Go are on the roadmap and not yet available.",
    group: "SDK And Runtime",
  },
];

export const navigationGroups = [
  {
    label: "Getting Started",
    items: docs.filter((doc) => doc.group === "Getting Started"),
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

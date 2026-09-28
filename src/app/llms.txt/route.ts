import { navigationGroups } from "@/lib/docs-navigation";
import {
  CONTACT_EMAIL,
  EXAMPLES_REPO_URL,
  MARKETING_URL,
  NPM_PACKAGE_URL,
  SDK_REPO_URL,
  SITE_URL,
} from "@/lib/site";

export const dynamic = "force-static";

/**
 * Generated from `navigationGroups` rather than kept as a static file, so a new
 * doc shows up here the moment it is added to the navigation. A hand-written
 * llms.txt goes stale within a couple of pages and then quietly misdescribes
 * the site.
 */
function body(): string {
  const sections = navigationGroups
    .map((group) => {
      const items = group.items
        .map(
          (doc) =>
            `- [${doc.title}](${new URL(doc.href, SITE_URL).toString()}): ${doc.description}`,
        )
        .join("\n");
      return `## ${group.label}\n\n${items}`;
    })
    .join("\n\n");

  return `# Ceiba Docs

> Ceiba is a Node-first API productization layer. It adds API keys, endpoint policies, plans, quotas, usage tracking, and subscription-gated access to an existing Express or Fastify API, without putting that API behind a gateway.

Ceiba runs as a separate Runtime service. A thin SDK sits in your own handler and asks Runtime whether a request is allowed; your routes, framework, and hosting stay as they are.

${sections}

## Elsewhere

- [Product site](${MARKETING_URL})
- [Node SDK on npm](${NPM_PACKAGE_URL})
- [Node SDK source](${SDK_REPO_URL})
- [Examples](${EXAMPLES_REPO_URL})

## Contact

- ${CONTACT_EMAIL}
`;
}

export function GET(): Response {
  return new Response(body(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}

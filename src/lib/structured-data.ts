import {
  CONTACT_EMAIL,
  GITHUB_ORG_URL,
  LINKEDIN_URL,
  MARKETING_URL,
  NPM_PACKAGE_URL,
  SDK_REPO_URL,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

/**
 * Stable @id values. Nodes reference each other by these rather than nesting,
 * so the whole site describes one entity instead of repeating a slightly
 * different copy of it per page.
 *
 * The organization is anchored on the marketing domain, not this one — the docs
 * site is a property of Ceiba, not a separate thing.
 */
export const ORGANIZATION_ID = `${MARKETING_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

type JsonLdNode = Record<string, unknown>;

export function organizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "Ceiba",
    url: MARKETING_URL,
    email: CONTACT_EMAIL,
    // The property that does the real work here: it lets a crawler conclude
    // these profiles are the same entity rather than four similarly named ones.
    sameAs: [GITHUB_ORG_URL, SDK_REPO_URL, NPM_PACKAGE_URL, LINKEDIN_URL],
  };
}

export function websiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "en",
  };
}

export function techArticleNode({
  title,
  description,
  href,
  dateModified,
}: {
  title: string;
  description: string;
  href: string;
  dateModified?: Date;
}): JsonLdNode {
  const url = new URL(href, SITE_URL).toString();
  return {
    "@type": "TechArticle",
    "@id": `${url}#article`,
    headline: title,
    description,
    url,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "en",
    ...(dateModified ? { dateModified: dateModified.toISOString() } : {}),
  };
}

export function breadcrumbNode(
  trail: ReadonlyArray<{ name: string; href: string }>,
): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: new URL(entry.href, SITE_URL).toString(),
    })),
  };
}

/**
 * Wraps nodes into the single @graph the page emits.
 *
 * `<` is escaped because a literal `</script>` anywhere in a value would end
 * the tag early. Nothing we put in here contains one today, but this is the
 * kind of thing that stops being true silently.
 */
export function graph(...nodes: JsonLdNode[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes,
  }).replace(/</g, "\\u003c");
}

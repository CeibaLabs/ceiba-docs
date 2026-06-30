import type { Metadata } from "next";
import { DocsArticle } from "@/components/docs-article";
import { getDocContent } from "@/lib/docs-content";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Choose the shortest path to protect a Node API, operate a Ceiba project, or manage API keys.",
  alternates: {
    canonical: "/",
  },
};

export default async function DocsHomePage() {
  const result = await getDocContent("");

  if (!result) {
    return null;
  }

  return <DocsArticle doc={result.doc} content={result.content} />;
}

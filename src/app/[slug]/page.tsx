import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsArticle } from "@/components/docs-article";
import { StructuredData } from "@/components/structured-data";
import { docLastModified } from "@/lib/docs-freshness";
import { getDocContent } from "@/lib/docs-content";
import { docs, findDoc } from "@/lib/docs-navigation";
import {
  breadcrumbNode,
  graph,
  techArticleNode,
} from "@/lib/structured-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return docs
    .filter((doc) => doc.slug)
    .map((doc) => ({
      slug: doc.slug,
    }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = findDoc(slug);

  if (!doc) {
    return {};
  }

  return {
    title: doc.title,
    description: doc.description,
    alternates: {
      canonical: doc.href,
    },
    openGraph: {
      title: doc.title,
      description: doc.description,
      url: doc.href,
    },
  };
}

export default async function DocsPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getDocContent(slug);

  if (!result) {
    notFound();
  }

  const { doc } = result;

  return (
    <>
      <StructuredData
        json={graph(
          techArticleNode({
            title: doc.title,
            description: doc.description,
            href: doc.href,
            dateModified: docLastModified(doc),
          }),
          breadcrumbNode([
            { name: "Docs", href: "/" },
            { name: doc.shortTitle, href: doc.href },
          ]),
        )}
      />
      <DocsArticle doc={doc} content={result.content} />
    </>
  );
}

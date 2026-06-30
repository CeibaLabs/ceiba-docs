import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsArticle } from "@/components/docs-article";
import { getDocContent } from "@/lib/docs-content";
import { docs, findDoc } from "@/lib/docs-navigation";

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

  return <DocsArticle doc={result.doc} content={result.content} />;
}

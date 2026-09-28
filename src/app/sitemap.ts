import type { MetadataRoute } from "next";
import { docLastModified } from "@/lib/docs-freshness";
import { docs } from "@/lib/docs-navigation";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return docs.map((doc) => ({
    url: new URL(doc.href, SITE_URL).toString(),
    lastModified: docLastModified(doc),
    changeFrequency: "monthly",
    priority: doc.href === "/" ? 1 : 0.8,
  }));
}

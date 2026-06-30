import type { MetadataRoute } from "next";
import { docs } from "@/lib/docs-navigation";

const baseUrl = "https://docs.useceiba.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return docs.map((doc) => ({
    url: new URL(doc.href, baseUrl).toString(),
    changeFrequency: "monthly",
    priority: doc.href === "/" ? 1 : 0.8,
  }));
}

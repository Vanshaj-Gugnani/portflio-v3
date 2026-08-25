import type { MetadataRoute } from "next";
import { PORTRAIT, SITE_URL, absoluteUrl, projectImages } from "./lib/site";

/**
 * One page, so one entry. The value here is not the URL list, it is the
 * `images` array: an image sitemap is the only way Google reliably discovers
 * the project posters and the portrait, since all of them are painted by
 * client-side JavaScript inside a pinned scroll reel rather than sitting in
 * plain <img> tags a crawler trips over.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      images: [absoluteUrl(PORTRAIT.path), ...projectImages],
    },
  ];
}

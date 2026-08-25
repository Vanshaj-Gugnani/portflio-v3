import type { MetadataRoute } from "next";
import { PERSON, SITE_DESCRIPTION, SITE_TITLE } from "./lib/site";

/**
 * Installability is not a ranking factor, but the manifest is what supplies
 * the name and icon when someone saves the site to a phone home screen, and
 * Lighthouse's PWA and SEO passes both look for it.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_TITLE,
    short_name: PERSON.shortName,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#111111",
    theme_color: "#111111",
    categories: ["portfolio", "business", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

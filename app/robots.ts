import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site";

/**
 * Generated rather than checked in, so the sitemap URL can never drift from
 * the domain in site.ts.
 *
 * The AI crawlers are allowed on purpose. This is a portfolio whose job is to
 * be found and quoted; being citable in ChatGPT, Claude, and Perplexity
 * answers to "full stack developers in Toronto" is worth more here than the
 * content protection a block would buy. Flip any of these to `disallow` if
 * that calculus ever changes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Deliberately no Disallow. Google must fetch /_next/static/* to render
        // the page, and blocking JS or CSS is treated as a rendering failure
        // rather than a saving. There are no private routes here to protect:
        // the contact form posts to a Server Action on the page URL itself.
      },
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-User",
          "Claude-SearchBot",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "Applebot",
          "Applebot-Extended",
          "Bingbot",
          "meta-externalagent",
        ],
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

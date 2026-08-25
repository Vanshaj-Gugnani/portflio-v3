import { projects } from "../data/projects";
import { contact } from "../data/contact";

/**
 * Single source of truth for everything SEO. The metadata in layout.tsx, the
 * JSON-LD graph, robots.txt, sitemap.xml, the web manifest, and the OG image
 * all read from here, so a fact is never stated in two places and drift is
 * impossible.
 *
 * Change the domain in one place: NEXT_PUBLIC_SITE_URL, or the fallback below.
 */
const FALLBACK_URL = "https://vgugnani.com";

/** No trailing slash, ever. Canonical URLs are built by appending to this. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_URL
).replace(/\/+$/, "");

/**
 * Optional. Facebook's Sharing Debugger lists fb:app_id under "required
 * properties", but it is only required to read domain Insights in the Meta
 * Business suite \u2014 it has no effect on how a shared link renders and no SEO
 * value. Set NEXT_PUBLIC_FB_APP_ID only if you create an app at
 * developers.facebook.com and actually want that analytics data.
 */
export const FB_APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID || "";

export const PERSON = {
  /** Full legal-ish name. This is the brand term the site should own. */
  name: "Vanshaj Gugnani",
  /** The wordmark used in the design. Google reads it as an alternate name. */
  shortName: "Vanshaj",
  /**
   * Leads the <title>, so it is also the primary ranking target. Keep it to
   * the phrase a client would actually type into Google.
   */
  jobTitle: "Full Stack Developer",
  email: contact.email,
} as const;

/**
 * The market this site targets, not a verified home address. `areaServed` is
 * a claim about who Vanshaj works with, which is safe to assert; a postal
 * address is not, so none is published.
 *
 * TODO(vansh): if you are in fact based in Toronto, adding `homeLocation` to
 * the Person node in structured-data.ts strengthens the local signal further.
 */
export const LOCATION = {
  city: "Toronto",
  region: "ON",
  country: "Canada",
  countryCode: "CA",
  locale: "en_CA",
} as const;

/**
 * 45 characters. Keyword first so the geo term carries weight, brand last so
 * name searches still resolve. Google truncates around 60.
 */
export const SITE_TITLE = "Full Stack Developer Toronto — Vanshaj Gugnani";

/** 148 characters. Sits inside the ~155 Google renders before truncating. */
export const SITE_DESCRIPTION =
  "Full stack developer building fast, accessible web products for teams in Toronto and across Canada. React, Next.js, Node, .NET, and AI integrations.";

/**
 * Shown on social cards. LinkedIn's Post Inspector warns below 100 characters
 * and the previous copy landed on exactly 99, so the stack is named here as
 * well. That buys the length honestly instead of padding it, and the extra
 * terms are the ones a client scanning a shared link is looking for.
 */
export const SOCIAL_DESCRIPTION =
  "Full stack developer building fast, accessible web products for teams in Toronto and across Canada \u2014 React, Next.js, Node, and AI integrations.";

/**
 * Google ignores meta keywords, but Bing and several AI crawlers still read
 * them, and they cost nothing. Kept short and honest rather than stuffed.
 */
export const KEYWORDS = [
  "full stack developer",
  "full stack developer Toronto",
  "web developer Toronto",
  "React developer",
  "Next.js developer",
  "Node.js developer",
  "AI integration developer",
  "freelance web developer Canada",
  "Vanshaj Gugnani",
];

/**
 * Feeds Person.knowsAbout in the JSON-LD graph. These are the entities Google
 * and the LLM crawlers use to decide what this person is an authority on, so
 * they are drawn from the skills actually listed on the page.
 */
export const EXPERTISE = [
  "Full Stack Development",
  "Web Development",
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "React Native",
  "Node.js",
  "NestJS",
  ".NET",
  "Spring Boot",
  "Python",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "REST APIs",
  "GraphQL",
  "AWS",
  "Azure",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Generative AI",
  "LangChain",
  "Retrieval Augmented Generation",
  "Web Accessibility",
  "Web Performance Optimization",
];

/** Absolute URL for the portrait. Used by OG tags and the JSON-LD graph. */
export const PORTRAIT = {
  path: "/Images/vanshaj_v3.png",
  alt: `${PERSON.name}, ${PERSON.jobTitle.toLowerCase()} working with teams in ${LOCATION.city} and across ${LOCATION.country}`,
} as const;

/** sameAs is how Google ties this site to the same entity elsewhere. */
export const SAME_AS = contact.socials
  .filter((social) => social.href)
  .map((social) => social.href);

export function absoluteUrl(path = "/") {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/** Every project image, for the image sitemap and the structured data. */
export const projectImages = projects
  .filter((project) => project.poster)
  .map((project) => absoluteUrl(project.poster as string));

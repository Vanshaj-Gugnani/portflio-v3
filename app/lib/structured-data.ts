import { projects } from "../data/projects";
import {
  EXPERTISE,
  LOCATION,
  PERSON,
  PORTRAIT,
  SAME_AS,
  SITE_DESCRIPTION,
  SITE_URL,
  absoluteUrl,
} from "./site";

/**
 * One linked JSON-LD graph rather than a pile of disconnected blobs. Every
 * node carries an @id and references the others by it, so Google resolves the
 * whole page to a single Person entity instead of guessing at four unrelated
 * ones. That resolution is what earns a knowledge panel for a name search and
 * what lets an LLM answer "who is Vanshaj Gugnani" with a citation.
 *
 * Node ids are stable fragments on the canonical URL. Do not renumber them:
 * external references (and Google's own entity cache) key off these strings.
 */
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const WEBPAGE_ID = `${SITE_URL}/#webpage`;
const PORTFOLIO_ID = `${SITE_URL}/#portfolio`;

const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: PERSON.name,
  alternateName: PERSON.shortName,
  url: SITE_URL,
  image: {
    "@type": "ImageObject",
    url: absoluteUrl(PORTRAIT.path),
    caption: PORTRAIT.alt,
  },
  jobTitle: PERSON.jobTitle,
  description: SITE_DESCRIPTION,
  email: `mailto:${PERSON.email}`,
  knowsAbout: EXPERTISE,
  knowsLanguage: ["English"],
  // Who he works with, rather than a home address that cannot be verified.
  areaServed: [
    { "@type": "City", name: LOCATION.city },
    { "@type": "Country", name: LOCATION.country },
  ],
  hasOccupation: {
    "@type": "Occupation",
    name: PERSON.jobTitle,
    occupationLocation: {
      "@type": "City",
      name: LOCATION.city,
      address: {
        "@type": "PostalAddress",
        addressRegion: LOCATION.region,
        addressCountry: LOCATION.countryCode,
      },
    },
    skills: EXPERTISE.join(", "),
  },
  // The single strongest entity-resolution signal available to a personal site.
  sameAs: SAME_AS,
};

const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: `${PERSON.name} — ${PERSON.jobTitle}`,
  description: SITE_DESCRIPTION,
  publisher: { "@id": PERSON_ID },
  inLanguage: "en",
};

const webpage = {
  // ProfilePage, not WebPage: this page is *about a person*, and Google treats
  // the two differently when deciding what to show for a name query.
  "@type": "ProfilePage",
  "@id": WEBPAGE_ID,
  url: SITE_URL,
  name: `${PERSON.name} — ${PERSON.jobTitle} in ${LOCATION.city}`,
  description: SITE_DESCRIPTION,
  isPartOf: { "@id": WEBSITE_ID },
  about: { "@id": PERSON_ID },
  mainEntity: { "@id": PERSON_ID },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: absoluteUrl(PORTRAIT.path),
    caption: PORTRAIT.alt,
  },
  inLanguage: "en",
};

/**
 * The reel, as data Google can read. Each panel becomes a CreativeWork crediting
 * the same Person node, which is how the work backs up the expertise claim in
 * `knowsAbout` instead of merely asserting it.
 */
const portfolio = {
  "@type": "ItemList",
  "@id": PORTFOLIO_ID,
  name: `Selected work by ${PERSON.name}`,
  numberOfItems: projects.length,
  itemListOrder: "https://schema.org/ItemListOrderAscending",
  itemListElement: projects.map((project, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "CreativeWork",
      "@id": `${SITE_URL}/#${project.id}`,
      name: project.title,
      description: project.blurb,
      creator: { "@id": PERSON_ID },
      keywords: project.stack.join(", "),
      ...(project.links[0] ? { url: project.links[0].href } : {}),
      ...(project.poster
        ? { image: absoluteUrl(project.poster), thumbnailUrl: absoluteUrl(project.poster) }
        : {}),
    },
  })),
};

export function buildStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [person, website, webpage, portfolio],
  };
}

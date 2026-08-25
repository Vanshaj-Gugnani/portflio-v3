export type SocialLink = {
  label: string;
  href: string;
};

/**
 * Single source of truth for how people reach you. The contact section and the
 * footer both read from here, so the address is never defined twice.
 *
 * `email` is published: it is the footer's mailto link and the contact form's
 * "email me directly" fallback when a send fails. Clearing it hides both rather
 * than shipping a dead `mailto:`; the form itself works either way.
 *
 * `socials` renders in the order listed. Any entry with an empty `href` is
 * filtered out, and an empty array hides the row entirely.
 */
export const contact = {
  email: "vanshajgugnani@gmail.com",
  socials: [
    {
      label: "linkedin",
      href: "https://www.linkedin.com/in/vanshaj-gugnani/",
    },
    { label: "github", href: "https://github.com/Vanshaj-Gugnani" },
    {
      label: "instagram",
      href: "https://www.instagram.com/vanshaj_gugnani/",
    },
  ] as SocialLink[],
};

/**
 * The options in the contact sentence. `value` is what lands in your inbox, so
 * these read as sentence fragments rather than as form keys.
 */
export const INTENTS = [
  { value: "a new build", label: "a new build" },
  { value: "a redesign", label: "a redesign" },
  { value: "an AI integration", label: "an AI integration" },
  { value: "something else", label: "something else" },
] as const;

/** Reads as a real invitation in a mail client rather than a blank compose. */
export const MAIL_SUBJECT = "Let's build something";

export function mailtoHref(email: string) {
  if (!email) return null;

  return `mailto:${email}?subject=${encodeURIComponent(MAIL_SUBJECT)}`;
}

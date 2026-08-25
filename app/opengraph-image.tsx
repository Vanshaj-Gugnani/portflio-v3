import { ImageResponse } from "next/og";
import { LOCATION, PERSON, SOCIAL_DESCRIPTION, SITE_URL } from "./lib/site";

export const alt = `${PERSON.name} — ${PERSON.jobTitle} in ${LOCATION.city}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The card every link to this site renders as, on LinkedIn, X, Slack, iMessage,
 * WhatsApp, and Discord. Without it those all fall back to a bare grey box,
 * which is the difference between a link that gets clicked and one that does not.
 *
 * Built with ImageResponse rather than a checked-in PNG so the name and role
 * stay in sync with site.ts automatically.
 *
 * Note: Involve ships as .woff2, which satori (the renderer behind
 * ImageResponse) cannot parse — it accepts ttf, otf, and woff only. The card
 * therefore uses the bundled default face. To brand it further, convert
 * Involve-SemiBold to .ttf and pass it via the `fonts` option.
 */
const INK = "#111111";
const PAPER = "#fefefe";
const ACCENT = "#f07077";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Accent rule, echoing the site's hero crosses. */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 8, background: ACCENT }} />
          <div
            style={{
              color: PAPER,
              fontSize: 26,
              letterSpacing: 6,
              opacity: 0.75,
            }}
          >
            {PERSON.jobTitle.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: PAPER,
              fontSize: 148,
              fontWeight: 700,
              letterSpacing: -4,
              lineHeight: 1,
              display: "flex",
            }}
          >
            {PERSON.shortName.toUpperCase()}
          </div>
          <div
            style={{
              color: PAPER,
              fontSize: 32,
              lineHeight: 1.35,
              opacity: 0.82,
              marginTop: 28,
              maxWidth: 900,
              display: "flex",
            }}
          >
            {SOCIAL_DESCRIPTION}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: PAPER,
            fontSize: 26,
          }}
        >
          <div style={{ display: "flex", opacity: 0.6 }}>
            {SITE_URL.replace(/^https?:\/\//, "")}
          </div>
          <div style={{ display: "flex", color: ACCENT }}>
            {LOCATION.city}, {LOCATION.country}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

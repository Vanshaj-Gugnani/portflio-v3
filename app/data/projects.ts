export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  /** Stable key. Also used for the panel DOM ids. */
  id: string;
  title: string;
  /** Optional. Rendered at the right of the panel head; omit with "". */
  year: string;
  /** Keep to 25 words or fewer. It sits in a single-line-height block. */
  blurb: string;
  /**
   * Rendered as "Next.js / React / Vercel", wrapping if it has to. Up to
   * about 8 entries stays on one line at desktop; past that it wraps to a
   * second row, which still reads fine but crowds the footer.
   */
  stack: string[];
  /**
   * Path under /public. Set to null while a project has no capture yet and the
   * panel renders its empty state instead of a broken player.
   */
  video: string | null;
  /** Frame grabbed from the video. Prevents a black flash before playback. */
  poster: string | null;
  /**
   * The capture's true ratio, as a CSS aspect-ratio value. The frame is built
   * from this, so an accurate value means nothing gets cropped. Defaults to
   * 16 / 9. Read it off `ffprobe` output: width / height.
   */
  aspect?: string;
  links: ProjectLink[];
};

/**
 * To add a project:
 *   1. Drop the capture in public/videos/. WebM (VP9) or MP4 (H.264) both work.
 *   2. Grab a poster frame, and note the dimensions for `aspect`:
 *        ffprobe -v error -select_streams v:0 \
 *          -show_entries stream=width,height -of default=nw=1 \
 *          public/videos/NAME.webm
 *        ffmpeg -ss 00:00:02 -i public/videos/NAME.webm -frames:v 1 \
 *          public/images/posters/NAME.jpg
 *   3. Add the entry here. The reel, counter, nav count, and progress bar all
 *      derive their length from this array, so nothing else needs touching.
 *
 * TODO(vansh): `year` is left blank on every entry, since it is not something
 * that can be read off the Try nows. The panel head hides it when empty, so
 * the layout is fine as-is; fill it in and it appears at the right of the head.
 *
 * `stack` is assigned by what each product actually does rather than by an
 * audit of the repos, so correct anything that is off: LangGraph and LangChain
 * sit on Prowave because it sells agent workflows and RAG, the NestJS and MySQL
 * pairing sits on Empreso because it runs auth, matching, and an ATS checker.
 */
export const projects: Project[] = [
  {
    id: "figure-out-media",
    title: "Figure Out Media",
    year: "",
    blurb:
      "Marketing site for a Toronto video studio. Brand films and campaign work presented as a scroll-driven reel the team can update themselves.",
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "AWS",
      "Vercel",
    ],
    video: "/videos/figureoutmedia-4x-fixed.webm",
    poster: "/images/posters/figureoutmedia.jpg",
    aspect: "1302 / 720",
    links: [{ label: "Try now", href: "https://figureoutmedia.com" }],
  },
  {
    id: "prowave",
    title: "Prowave",
    year: "",
    blurb:
      "Site for an AI automation agency. Explains workflow, voice, and support agents to non-technical buyers without drowning them in implementation detail.",
    stack: [
      "Next.js",
      "NestJS",
      "TypeScript",
      "Python",
      "LangGraph",
      "LangChain",
      "PostgreSQL",
      "Cloudflare",
    ],
    video: "/videos/prowave-4x-fixed.webm",
    poster: "/images/posters/prowave.jpg",
    aspect: "1302 / 720",
    links: [{ label: "Try now", href: "https://prowave.co" }],
  },
  {
    id: "empreso",
    title: "Empreso",
    year: "",
    blurb:
      "Career platform for people moving into tech roles. Covers resume tooling, interview prep, background checks, and training across five service tracks.",
    stack: [
      "Next.js",
      "NestJS",
      "TypeScript",
      "MySQL",
      "Redis",
      "Generative AI",
      "Azure",
    ],
    video: "/videos/empreso-4x-fixed.webm",
    poster: "/images/posters/empreso.jpg",
    aspect: "1302 / 720",
    links: [{ label: "Try now", href: "https://empreso.ca" }],
  },
  {
    id: "konnecture",
    title: "Konnecture",
    year: "",
    blurb:
      "Consultancy site for a business scaling firm. Growth planning, automation, and investor readiness laid out for founders preparing to raise or expand.",
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Generative AI",
      "Vercel",
    ],
    video: "/videos/konnecture-4x-fixed.webm",
    poster: "/images/posters/konnecture.jpg",
    aspect: "1302 / 720",
    links: [{ label: "Try now", href: "https://konnecture.vgugnani.com" }],
  },
];

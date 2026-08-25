/**
 * X/Twitter reads its own tag rather than falling back to og:image, so the
 * card is re-exported here at the same 1200x630. One design, two routes.
 */
export { default, alt, size, contentType } from "./opengraph-image";

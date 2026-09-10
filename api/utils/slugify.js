/**
 * Turns a post title into a URL-friendly slug, e.g.
 * "Hello, World! 2024" -> "hello-world-2024"
 * A random suffix is appended by the caller if the slug already exists.
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // remove non-word chars
    .replace(/[\s_-]+/g, "-")   // collapse whitespace/underscores to a single dash
    .replace(/^-+|-+$/g, "")    // trim leading/trailing dashes
}

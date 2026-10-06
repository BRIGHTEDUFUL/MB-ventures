/**
 * Generates a clean URL slug from a string.
 */
export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD") // Decompose combined graphemes (e.g. accents)
    .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric characters except spaces & hyphens
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with a single hyphen
    .replace(/-+/g, "-") // Collapse consecutive hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
}

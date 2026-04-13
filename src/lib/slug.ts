/**
 * Convert a product name to a URL-friendly slug.
 * e.g. "Sodium Cyanide (98%)" → "sodium-cyanide-98"
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()]/g, "") // remove parentheses
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanum with dashes
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
}

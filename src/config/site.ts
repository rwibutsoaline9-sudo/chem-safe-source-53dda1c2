/**
 * The single source of truth for the public site address.
 *
 * Everything that needs an absolute URL — canonical tags, Open Graph tags,
 * structured data (Organization / Product / BreadcrumbList) and the sitemap —
 * reads it from here. To move the site to a real custom domain, change
 * VITE_SITE_URL in the environment (or the fallback below) and nothing else.
 */
const RAW_SITE_URL =
  // Browser / Vite build
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
  // Node (the sitemap generator runs outside Vite)
  (typeof process !== "undefined" ? process.env?.VITE_SITE_URL : undefined) ||
  "https://chem-safe-source.lovable.app";

/** Absolute origin, never with a trailing slash. */
export const SITE_URL = String(RAW_SITE_URL).replace(/\/+$/, "");

/** Builds an absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

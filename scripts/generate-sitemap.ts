// Runs before `vite dev` and `vite build`; writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://chem-safe-source.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/products", changefreq: "weekly", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/safety", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/shipping", changefreq: "yearly", priority: "0.3" },
];

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function fetchProductEntries(): Promise<SitemapEntry[]> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn("[sitemap] Supabase env missing — skipping product routes");
    return [];
  }
  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("products")
      .select("slug, name, updated_at");
    if (error) throw error;
    return (data ?? []).map((p: any) => ({
      path: `/products/${p.slug || toSlug(p.name)}`,
      lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : undefined,
      changefreq: "weekly" as const,
      priority: "0.8",
    }));
  } catch (e) {
    console.warn("[sitemap] failed to fetch products:", e);
    return [];
  }
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

(async () => {
  const products = await fetchProductEntries();
  const entries = [...staticEntries, ...products];
  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
})();

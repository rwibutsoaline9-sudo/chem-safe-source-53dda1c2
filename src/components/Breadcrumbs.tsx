import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const SITE_URL = "https://chem-safe-source.lovable.app";

export interface Crumb {
  name: string;
  path: string; // e.g. "/products"
}

interface BreadcrumbsProps {
  items: Crumb[];
  /** Hide the visual trail and only emit JSON-LD. */
  visualHidden?: boolean;
}

/**
 * Renders a visible breadcrumb trail and emits BreadcrumbList JSON-LD
 * for Google rich results.
 */
export const Breadcrumbs = ({ items, visualHidden = false }: BreadcrumbsProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      {!visualHidden && (
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            {items.map((c, i) => {
              const isLast = i === items.length - 1;
              return (
                <li key={c.path} className="flex items-center gap-1">
                  {isLast ? (
                    <span aria-current="page" className="text-foreground">{c.name}</span>
                  ) : (
                    <Link to={c.path} className="hover:text-primary">{c.name}</Link>
                  )}
                  {!isLast && <ChevronRight className="w-3 h-3" />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </>
  );
};

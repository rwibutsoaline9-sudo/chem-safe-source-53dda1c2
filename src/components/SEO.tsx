import { Helmet } from "react-helmet-async";

const SITE_URL = "https://chem-safe-source.lovable.app";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "product";
}

/**
 * Per-route SEO. Sets unique title/description/canonical/og:* via react-helmet-async.
 * Title <60 chars, description <160 chars.
 */
export const SEO = ({ title, description, path, image, type = "website" }: SEOProps) => {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

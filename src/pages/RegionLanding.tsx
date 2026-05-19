import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShieldCheck, Ship, FileCheck2, Globe } from "lucide-react";
import { REGIONS, REGION_LIST, type RegionId } from "@/data/regions";
import { RegionChat } from "@/components/RegionChat";

const SITE_URL = "https://chem-safe-source.lovable.app";

const RegionLanding = () => {
  const { regionSlug } = useParams<{ regionSlug: string }>();
  const region = regionSlug && (REGIONS as Record<string, any>)[regionSlug];
  if (!region) return <Navigate to="/" replace />;

  const path = `/regions/${region.slug}`;
  const url = `${SITE_URL}${path}`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    inLanguage: region.lang,
    mainEntity: region.faq.map((f: { q: string; a: string }) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background" lang={region.lang} dir={region.dir}>
      <Helmet>
        <html lang={region.lang} dir={region.dir} />
        <title>{region.seoTitle}</title>
        <meta name="description" content={region.seoDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={region.seoTitle} />
        <meta property="og:description" content={region.seoDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={region.hreflang.replace("-", "_")} />
        {REGION_LIST.map((r) => (
          <link
            key={r.id}
            rel="alternate"
            hrefLang={r.hreflang}
            href={`${SITE_URL}/regions/${r.slug}`}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/`} />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-b from-muted/60 to-background py-12 sm:py-16 md:py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: region.name, path },
            ]}
          />
          <div className="max-w-4xl mt-6">
            <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">
              {region.heroEyebrow}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              {region.heroTitle}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
              {region.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact">
                <Button size="lg">{region.ctaPrimary}</Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline">{region.ctaSecondary}</Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-primary" /> {region.hub}</span>
              <span>•</span>
              <span>{region.currency}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-8">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold">{region.complianceTitle}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{region.complianceIntro}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {region.complianceItems.map((item: { title: string; body: string }, i: number) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="py-12 sm:py-16 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-8">
            <div className="flex items-center gap-2 mb-3">
              <FileCheck2 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold">{region.safetyTitle}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{region.safetyIntro}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {region.safetyItems.map((item: { title: string; body: string }, i: number) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Ship className="w-6 h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold">{region.shippingTitle}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {region.shippingItems.map((item: { title: string; body: string }, i: number) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 bg-muted/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">{region.faqTitle}</h2>
          <Accordion type="single" collapsible className="w-full">
            {region.faq.map((f: { q: string; a: string }, i: number) => (
              <AccordionItem key={i} value={`r-faq-${i}`}>
                <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">{region.closingTitle}</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">{region.closingBody}</p>
              <Link to="/contact">
                <Button size="lg">{region.ctaPrimary}</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Other regions */}
          <div className="mt-12">
            <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Other regions
            </p>
            <div className="flex flex-wrap gap-2">
              {REGION_LIST.filter((r) => r.id !== (region.id as RegionId)).map((r) => (
                <Link
                  key={r.id}
                  to={`/regions/${r.slug}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-sm hover:border-primary hover:text-primary transition"
                >
                  <span>{r.flag}</span>
                  <span>{r.name}</span>
                  <span className="text-muted-foreground">({r.localizedName})</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <RegionChat region={region} />
    </div>
  );
};

export default RegionLanding;

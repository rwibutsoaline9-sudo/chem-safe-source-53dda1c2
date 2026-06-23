import { Helmet } from "react-helmet-async";
import { Link, Navigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShieldCheck, Ship, FileCheck2, Globe, Clock, Banknote } from "lucide-react";
import {
  COUNTRIES,
  COUNTRIES_BY_REGION,
  COUNTRY_MAP,
  REGION_LABEL,
  type CountryContent,
} from "@/data/countries";

const SITE_URL = "https://chem-safe-source.lovable.app";

const buildFaq = (c: CountryContent) => [
  {
    q: `Do you supply industrial chemicals to ${c.name}?`,
    a: `Yes. We ship verified, documented industrial chemicals to ${c.name} via ${c.port}, with full ${c.framework} documentation and SDS in ${c.language}.`,
  },
  {
    q: `What is the lead time for delivery to ${c.name}?`,
    a: `Typical lead time is ${c.leadTime} once your KYC and business license are approved. Air freight is available for urgent orders.`,
  },
  {
    q: `Which regulator handles chemical imports in ${c.name}?`,
    a: `${c.regulator}. Every shipment is prepared to clear customs under ${c.framework}, including classification, packing, and transport declarations.`,
  },
  {
    q: `Which Incoterms do you offer for ${c.name}?`,
    a: `We routinely quote ${c.incoterms} for ${c.name}. DDP is available where customs and local registration allow.`,
  },
  {
    q: `Can I pay in ${c.currency}?`,
    a: `Invoices for ${c.name} can be issued in ${c.currency} or USD. We accept international wire (T/T), letter of credit (L/C at sight), and Stripe corporate card for orders under USD 10,000.`,
  },
];

const CountryLanding = () => {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const country = countrySlug ? COUNTRY_MAP[countrySlug] : undefined;
  if (!country) return <Navigate to="/" replace />;

  const path = `/ship-to/${country.slug}`;
  const url = `${SITE_URL}${path}`;
  const faq = buildFaq(country);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Ship to", item: `${SITE_URL}/ship-to` },
      { "@type": "ListItem", position: 3, name: country.name, item: url },
    ],
  };

  const title = `Industrial Chemicals Supplier in ${country.name} — ChemSupply Pro`;
  const description = `Bulk industrial chemicals delivered to ${country.name} via ${country.port}. ${country.framework} compliant. SDS, COA, and quote within 24 hours.`;

  const sameRegion = (COUNTRIES_BY_REGION[country.region] || []).filter(
    (c) => c.slug !== country.slug,
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbsJsonLd)}</script>
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-b from-muted/60 to-background py-12 sm:py-16 md:py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Ship to", path: "/ship-to" },
              { name: country.name, path },
            ]}
          />
          <div className="max-w-4xl mt-6">
            <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">
              {country.flag} {REGION_LABEL[country.region]}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Industrial chemicals delivered to {country.name}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
              Verified supplier of bulk industrial and laboratory chemicals to {country.name}.
              Shipping through {country.port}, fully compliant with {country.framework},
              with SDS and COA in {country.language}.
              {country.notes ? ` ${country.notes}` : ""}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact">
                <Button size="lg">Request a quote for {country.name}</Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline">Browse catalog</Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 text-sm">
              <div className="flex items-start gap-2">
                <Ship className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">Port of entry</div>
                  <div className="text-muted-foreground">{country.port}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">Lead time</div>
                  <div className="text-muted-foreground">{country.leadTime}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Banknote className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">Currency</div>
                  <div className="text-muted-foreground">{country.currency}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">Incoterms</div>
                  <div className="text-muted-foreground">{country.incoterms}</div>
                </div>
              </div>
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
              <h2 className="text-2xl sm:text-3xl font-bold">Compliance for {country.name}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Every shipment into {country.name} clears under {country.framework} and is reviewed by{" "}
              {country.regulator}. We prepare the full document pack before goods leave the warehouse.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Regulatory framework</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{country.framework}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Local authority</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{country.regulator}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">SDS &amp; COA</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  16-section GHS Safety Data Sheets in {country.language}, plus batch Certificate
                  of Analysis signed by our QA manager.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Shipping */}
      <section className="py-12 sm:py-16 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-8">
            <div className="flex items-center gap-2 mb-3">
              <FileCheck2 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold">Shipping &amp; logistics to {country.name}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Port &amp; hub</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{country.port}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Incoterms 2020</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{country.incoterms}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Lead time</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{country.leadTime}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">FAQ — shipping to {country.name}</h2>
          <Accordion type="single" collapsible className="w-full">
            {faq.map((f, i) => (
              <AccordionItem key={i} value={`c-faq-${i}`}>
                <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 bg-muted/40">
        <div className="container mx-auto px-4">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Ready to import into {country.name}?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get a detailed quote within 24 business hours, including SDS, COA and{" "}
                {country.incoterms.split(",")[0].trim()} pricing to {country.port}.
              </p>
              <Link to="/contact">
                <Button size="lg">Request a quote</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Same region */}
          {sameRegion.length > 0 && (
            <div className="mt-12">
              <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                Also shipping in {REGION_LABEL[country.region]}
              </p>
              <div className="flex flex-wrap gap-2">
                {sameRegion.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/ship-to/${c.slug}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-sm hover:border-primary hover:text-primary transition"
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All countries */}
          <div className="mt-8">
            <Link to="/ship-to" className="text-sm text-primary hover:underline">
              View all {COUNTRIES.length} destination countries →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CountryLanding;

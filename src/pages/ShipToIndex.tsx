import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { COUNTRIES_BY_REGION, REGION_LABEL, COUNTRIES } from "@/data/countries";

const SITE_URL = "https://chem-safe-source.lovable.app";

const ShipToIndex = () => {
  const title = `Worldwide Industrial Chemical Shipping — ${COUNTRIES.length} Countries`;
  const description = `We supply bulk industrial chemicals to ${COUNTRIES.length} countries across North America, Europe, the Middle East, Latin America and Oceania. SDS, COA and quotes in 24 hours.`;
  const url = `${SITE_URL}/ship-to`;

  const regionOrder: (keyof typeof REGION_LABEL)[] = [
    "north-america",
    "europe",
    "middle-east",
    "oceania",
    "latin-america",
    "africa",
    "asia",
  ];

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
      </Helmet>

      <section className="bg-gradient-to-b from-muted/60 to-background py-12 sm:py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Ship to", path: "/ship-to" }]} />
          <div className="max-w-3xl mt-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Industrial chemical shipping — {COUNTRIES.length} destination countries
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Pick your destination to see local port of entry, regulator, lead time, currency and
              Incoterms. Every shipment includes SDS in the local language and a batch COA.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 space-y-10">
          {regionOrder.map((region) => {
            const list = COUNTRIES_BY_REGION[region];
            if (!list || list.length === 0) return null;
            return (
              <div key={region}>
                <h2 className="text-xl sm:text-2xl font-bold mb-4">{REGION_LABEL[region]}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {list.map((c) => (
                    <Link key={c.slug} to={`/ship-to/${c.slug}`}>
                      <Card className="hover:border-primary transition h-full">
                        <CardContent className="p-4 flex items-center gap-3">
                          <span className="text-2xl">{c.flag}</span>
                          <div>
                            <div className="font-semibold">{c.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {c.port.split(",")[0]} · {c.currency}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ShipToIndex;

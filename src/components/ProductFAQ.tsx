import { Helmet } from "react-helmet-async";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ProductForFAQ {
  name: string;
  category: string;
  purity?: string | null;
  grade?: string | null;
  cas_number?: string | null;
  packaging?: string[] | null;
  is_restricted?: boolean | null;
  price_unit?: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

/**
 * Build 5 product-specific FAQs covering specs, packaging, SDS, shipping, compliance.
 * Generated from product fields so each page has unique content for search.
 */
export function buildProductFAQs(p: ProductForFAQ): FAQItem[] {
  const pkg = p.packaging?.length ? p.packaging.join(", ") : "drums, IBC totes, and bulk ISO tanks";
  const purity = p.purity ? `${p.purity} purity` : "industrial-grade purity";
  const grade = p.grade ? `${p.grade} grade` : "technical/industrial grade";
  const cas = p.cas_number ? ` (CAS ${p.cas_number})` : "";
  const restricted = p.is_restricted
    ? "Yes. This product is regulated and requires a valid business license, end-use declaration, and KYC documentation before shipment. Export and import permits may also be required depending on destination."
    : "No special license is required, but ChemSupply Pro ships exclusively B2B to verified businesses. Standard KYC (business registration + contact verification) applies to every order.";

  return [
    {
      q: `What are the technical specifications of ${p.name}?`,
      a: `${p.name}${cas} is supplied at ${purity}, ${grade}, classified under ${p.category}. Each batch ships with a Certificate of Analysis (COA) documenting assay, appearance, moisture, heavy metals, and other relevant parameters. Custom specifications are available on request for qualified industrial buyers.`,
    },
    {
      q: `What packaging and order sizes are available for ${p.name}?`,
      a: `Available packaging: ${pkg}. Minimum order quantities depend on packaging format; bulk orders quoted by ${p.price_unit ?? "kg / MT"}. We can also arrange custom labeling, private-label packaging, and palletization for container shipments.`,
    },
    {
      q: `How do I obtain the Safety Data Sheet (SDS) for ${p.name}?`,
      a: `A GHS-compliant SDS is provided free of charge to verified business customers. After submitting a quote request, the SDS — together with the COA and handling guide — is emailed within 24 business hours. SDS documents follow REACH, OSHA HCS 2012, and UN GHS Rev. 9 standards.`,
    },
    {
      q: `How is ${p.name} shipped internationally?`,
      a: `We ship worldwide by sea (FCL/LCL), air freight, and road/rail for regional orders. Hazardous classifications are declared per IMDG/IATA/ADR. Standard Incoterms supported: EXW, FOB, CIF, DAP, DDP. Lead time is typically 5–10 business days for stocked items plus transit. Express options available on request.`,
    },
    {
      q: `What compliance and regulatory documentation is required to buy ${p.name}?`,
      a: `${restricted} For international shipments we provide commercial invoice, packing list, COA, SDS, certificate of origin, and (where applicable) REACH pre-registration, TSCA, GHS labeling, and dangerous-goods declarations. Buyers are responsible for local import permits and end-use compliance.`,
    },
  ];
}

interface ProductFAQProps {
  product: ProductForFAQ;
  pageUrl: string;
}

export const ProductFAQ = ({ product, pageUrl }: ProductFAQProps) => {
  const faqs = buildProductFAQs(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section aria-labelledby="product-faq-heading" className="mt-12">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <h2 id="product-faq-heading" className="text-2xl sm:text-3xl font-bold mb-2">
        Frequently Asked Questions
      </h2>
      <p className="text-muted-foreground mb-6">
        Specifications, packaging, SDS access, shipping, and compliance details for {product.name}.
      </p>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

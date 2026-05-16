import { Truck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Shipping Policy — ChemSupply Pro"
        description="Hazmat-compliant shipping, lead times, packaging, and international delivery for industrial chemicals."
        path="/shipping"
      />
      <section className="bg-muted/50 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Shipping Policy", path: "/shipping" }]} />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Truck className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Shipping Policy</h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Last updated: January 2025
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          
          <Alert className="mb-8 sm:mb-10 md:mb-12 border-primary/50 bg-primary/5">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <AlertTitle className="text-base sm:text-lg font-semibold">Hazardous Materials Notice</AlertTitle>
            <AlertDescription className="text-sm sm:text-base mt-2">
              Chemical products are classified as hazardous materials and require special handling, packaging, and documentation. All shipments comply with DOT, IATA, IMDG, and other applicable regulations.
            </AlertDescription>
          </Alert>

          <div className="prose prose-slate max-w-none">
            
            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">1. Shipping Methods</h2>
              
              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">1.1 Domestic Shipping (USA)</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                We offer multiple shipping options for domestic orders:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li><strong>Ground Shipping:</strong> 3-7 business days (standard for non-urgent orders)</li>
                <li><strong>Expedited Shipping:</strong> 2-3 business days (additional fees apply)</li>
                <li><strong>Next Day Air:</strong> 1 business day (for eligible products, premium rates)</li>
                <li><strong>Freight/LTL:</strong> For bulk orders over 150 lbs or palletized shipments</li>
              </ul>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-4">
                <strong>Note:</strong> Certain hazardous materials cannot be shipped via air transport and are limited to ground shipping only.
              </p>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">1.2 International Shipping</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                We ship to verified businesses worldwide. International shipping includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li><strong>Express International:</strong> 3-5 business days</li>
                <li><strong>Standard International:</strong> 7-14 business days</li>
                <li><strong>Ocean Freight:</strong> For large bulk orders (4-8 weeks)</li>
              </ul>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-4">
                International shipments require additional documentation including commercial invoices, certificates of analysis, and export/import permits.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">2. Shipping Costs</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Shipping costs are calculated based on:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Product weight and dimensions</li>
                <li>Destination address and distance</li>
                <li>Shipping method selected</li>
                <li>Hazardous material classification and handling requirements</li>
                <li>Special packaging or temperature control needs</li>
              </ul>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-4">
                Exact shipping costs will be calculated and displayed during checkout. For large or custom orders, please request a quote for accurate freight pricing.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">3. Order Processing Time</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Processing times vary based on product availability and order complexity:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li><strong>In-Stock Items:</strong> 1-2 business days</li>
                <li><strong>Restricted Chemicals:</strong> 2-5 business days (pending license verification)</li>
                <li><strong>Custom Orders:</strong> 5-10 business days</li>
                <li><strong>Bulk Orders:</strong> 7-14 business days</li>
              </ul>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-4">
                Orders are processed Monday through Friday, excluding holidays. Orders placed after 2:00 PM EST will be processed the next business day.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">4. Hazardous Materials Handling</h2>
              
              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">4.1 Packaging Requirements</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                All chemical shipments are packaged according to regulatory standards:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>UN-certified containers for hazardous materials</li>
                <li>Proper cushioning and secondary containment</li>
                <li>Hazard labels and placards as required</li>
                <li>Emergency response information (ERI)</li>
                <li>Safety Data Sheets (SDS) included with shipment</li>
              </ul>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">4.2 Hazmat Fees</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Hazardous material shipments incur additional fees:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Hazmat handling fee: $30-$75 per shipment</li>
                <li>Special packaging materials</li>
                <li>Regulatory compliance documentation</li>
                <li>Carrier surcharges for dangerous goods</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">5. Delivery and Signature Requirements</h2>
              
              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">5.1 Signature Required</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                All chemical shipments require a signature upon delivery:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Adult signature (21+) required for restricted chemicals</li>
                <li>Business address delivery recommended</li>
                <li>Authorized personnel must be available to receive shipment</li>
                <li>Residential delivery may be restricted for certain products</li>
              </ul>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">5.2 Delivery Attempts</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                If delivery cannot be completed:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Carrier will make up to 3 delivery attempts</li>
                <li>Package may be held at local carrier facility for pickup</li>
                <li>Unclaimed packages will be returned to sender (fees apply)</li>
                <li>Customer is responsible for reshipment costs</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">6. Tracking and Notifications</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Stay informed about your shipment:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Tracking number provided via email when order ships</li>
                <li>Real-time tracking available through carrier website</li>
                <li>Email notifications for key shipment milestones</li>
                <li>SMS alerts available upon request</li>
                <li>Estimated delivery date provided</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">7. International Shipping Requirements</h2>
              
              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">7.1 Documentation</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                International shipments require:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Commercial invoice with accurate product descriptions</li>
                <li>Certificate of Analysis (COA)</li>
                <li>Export licenses (if applicable)</li>
                <li>Import permits from destination country</li>
                <li>Dangerous Goods Declaration (DGD)</li>
                <li>Material Safety Data Sheet (MSDS/SDS)</li>
              </ul>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">7.2 Customs and Duties</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                International customers are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>All customs duties, taxes, and fees</li>
                <li>Import clearance procedures</li>
                <li>Compliance with local regulations</li>
                <li>Additional storage fees if clearance is delayed</li>
              </ul>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">7.3 Restricted Destinations</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We cannot ship to countries under trade sanctions or embargo. Certain chemicals may be restricted in specific countries. Please contact us to verify if we can ship to your location.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">8. Damaged or Lost Shipments</h2>
              
              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">8.1 Inspection Upon Delivery</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Please inspect all shipments immediately upon delivery:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Check for visible damage to packaging</li>
                <li>Note any damage on delivery receipt</li>
                <li>Photograph damaged packages before opening</li>
                <li>Report damage within 24 hours</li>
              </ul>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">8.2 Claims Process</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                To file a claim for damaged or lost shipments:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Contact us within 7 days of delivery (or expected delivery for lost packages)</li>
                <li>Provide order number, tracking information, and photos</li>
                <li>Retain all packaging materials for inspection</li>
                <li>We will work with the carrier to resolve the claim</li>
                <li>Replacement or refund issued upon claim approval</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">9. Shipping Restrictions</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Certain products cannot be shipped to specific locations:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>PO Boxes (most hazardous materials)</li>
                <li>APO/FPO addresses (restricted items)</li>
                <li>Residential addresses (certain chemicals)</li>
                <li>Remote or rural areas (carrier limitations)</li>
                <li>States with specific chemical restrictions</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">10. Temperature-Controlled Shipping</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Some chemicals require temperature-controlled shipping:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Insulated packaging with gel packs or dry ice</li>
                <li>Expedited shipping to minimize transit time</li>
                <li>Additional fees for temperature control ($25-$100)</li>
                <li>Seasonal shipping restrictions may apply</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">11. Bulk and Freight Shipments</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                For large orders requiring freight shipping:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Palletized shipments for orders over 500 lbs</li>
                <li>Liftgate service available (additional fee)</li>
                <li>Inside delivery or dock delivery options</li>
                <li>Appointment scheduling required</li>
                <li>Commercial location with loading dock recommended</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">12. Contact for Shipping Questions</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                For shipping inquiries or special requests:
              </p>
              <ul className="list-none space-y-2 text-sm sm:text-base text-muted-foreground">
                <li><strong>Shipping Department:</strong> support@drchems.com</li>
                <li><strong>Phone / WhatsApp:</strong> +1 (612) 293-1250</li>
                <li><strong>Hours:</strong> Monday–Friday, 8:00 AM – 5:00 PM CST</li>
              </ul>
            </div>

            <div className="bg-muted/50 p-4 sm:p-6 rounded-lg border border-border">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <strong>Safety First:</strong> All shipments comply with DOT (Department of Transportation), IATA (International Air Transport Association), and IMDG (International Maritime Dangerous Goods) regulations. We prioritize safe handling and delivery of all chemical products.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}


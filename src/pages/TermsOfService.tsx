import { FileText } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Terms of Service — ChemSupply Pro"
        description="Terms governing the use of ChemSupply Pro services, ordering, and chemical supply agreements."
        path="/terms"
      />
      <section className="bg-muted/50 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Terms of Service", path: "/terms" }]} />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Last updated: January 2025
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-slate max-w-none">
            
            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                By accessing and using ChemSupply Pro's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                These Terms of Service apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">2. Business-to-Business Only</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                ChemSupply Pro provides chemical products exclusively to verified businesses, educational institutions, research facilities, and licensed organizations. We do not sell to individual consumers.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                All customers must provide valid business registration, tax identification, and appropriate licenses for restricted chemicals before orders can be processed.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">3. Account Registration</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                To purchase products, you must create an account and provide accurate, complete, and current information. You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring all provided documentation is authentic and valid</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">4. Product Information and Availability</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                We strive to provide accurate product descriptions, specifications, and Safety Data Sheets (SDS). However:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Product availability is subject to change without notice</li>
                <li>We reserve the right to limit quantities or refuse orders</li>
                <li>Prices are subject to change and will be confirmed at time of order</li>
                <li>Product images are for reference only; actual products may vary</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">5. Restricted Chemicals</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Certain chemicals are subject to regulatory restrictions and require additional documentation:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Valid licenses and permits for controlled substances</li>
                <li>End-use declarations and certifications</li>
                <li>Compliance with local, national, and international regulations</li>
                <li>Additional verification and approval processes</li>
              </ul>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-4">
                We reserve the right to refuse sale of restricted chemicals if proper documentation is not provided or if we suspect misuse.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">6. Pricing and Payment</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                All prices are quoted in USD unless otherwise specified. Payment terms include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Prices exclude shipping, handling, and applicable taxes</li>
                <li>Payment must be received before shipment unless credit terms are approved</li>
                <li>We accept wire transfers, credit cards, and approved purchase orders</li>
                <li>Late payments may incur interest charges as permitted by law</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">7. Shipping and Delivery</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Shipping terms are detailed in our Shipping Policy. Key points include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Delivery times are estimates and not guaranteed</li>
                <li>Risk of loss transfers upon delivery to carrier</li>
                <li>Hazardous materials require special handling and documentation</li>
                <li>International shipments subject to customs and import regulations</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">8. Returns and Refunds</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Due to the nature of chemical products:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Returns are only accepted for damaged or defective products</li>
                <li>Claims must be made within 7 days of delivery</li>
                <li>Opened or used chemicals cannot be returned for safety reasons</li>
                <li>Refunds or replacements at our discretion after inspection</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">9. Safety and Proper Use</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                By purchasing chemicals from ChemSupply Pro, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Review and follow all Safety Data Sheets (SDS)</li>
                <li>Use appropriate personal protective equipment (PPE)</li>
                <li>Comply with all applicable safety regulations</li>
                <li>Properly store, handle, and dispose of chemicals</li>
                <li>Train personnel in safe handling procedures</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">10. Limitation of Liability</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                ChemSupply Pro shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Use or inability to use our products or services</li>
                <li>Improper handling, storage, or use of chemicals</li>
                <li>Unauthorized access to or alteration of your data</li>
                <li>Any other matter relating to our service</li>
              </ul>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-4">
                Our total liability shall not exceed the amount paid for the specific product in question.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">11. Intellectual Property</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                All content on this website, including text, graphics, logos, images, and software, is the property of ChemSupply Pro and protected by copyright and trademark laws. Unauthorized use is prohibited.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">12. Compliance with Laws</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                You agree to comply with all applicable local, state, national, and international laws and regulations regarding the purchase, use, storage, and disposal of chemical products.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">13. Modifications to Terms</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of our services constitutes acceptance of modified terms.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">14. Governing Law</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which ChemSupply Pro operates, without regard to conflict of law provisions.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">15. Contact Information</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <ul className="list-none space-y-2 text-sm sm:text-base text-muted-foreground">
                <li><strong>Email:</strong> support@drchems.com</li>
                <li><strong>Phone:</strong> +1 (612) 293-1250</li>
                <li><strong>Address:</strong> 30 E 7th St, St Paul, MN 55101, United States</li>
              </ul>
            </div>

            <div className="bg-muted/50 p-4 sm:p-6 rounded-lg border border-border">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <strong>Important Notice:</strong> By using ChemSupply Pro's services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our services.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}


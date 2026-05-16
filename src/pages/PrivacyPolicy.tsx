import { Shield } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy — ChemSupply Pro"
        description="How ChemSupply Pro collects, uses, and protects your personal and business information."
        path="/privacy"
      />
      <section className="bg-muted/50 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy" }]} />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Privacy Policy</h1>
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
              <h2 className="text-xl sm:text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                ChemSupply Pro ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">2.1 Personal Information</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                We collect personal information that you voluntarily provide when:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Registering for an account</li>
                <li>Placing an order</li>
                <li>Requesting a quote</li>
                <li>Contacting customer support</li>
                <li>Subscribing to newsletters or updates</li>
              </ul>
              
              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">2.2 Business Information</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                As a B2B supplier, we collect business-related information including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Company name and registration details</li>
                <li>Tax identification numbers</li>
                <li>Business licenses and permits</li>
                <li>Authorized purchaser information</li>
                <li>Billing and shipping addresses</li>
                <li>Purchase history and order details</li>
              </ul>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">2.3 Automatically Collected Information</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                When you visit our website, we automatically collect certain information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>IP address and location data</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Pages viewed and time spent</li>
                <li>Referring website addresses</li>
                <li>Device information</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Process and fulfill your orders</li>
                <li>Verify business credentials and licenses</li>
                <li>Communicate about orders, quotes, and inquiries</li>
                <li>Comply with regulatory requirements for chemical sales</li>
                <li>Improve our website and services</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Detect and prevent fraud or unauthorized activities</li>
                <li>Maintain records for legal and compliance purposes</li>
                <li>Analyze usage patterns and trends</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">4. Legal Basis for Processing (GDPR)</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                If you are from the European Economic Area (EEA), our legal basis for collecting and using your information includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li><strong>Contract Performance:</strong> Processing necessary to fulfill our contract with you</li>
                <li><strong>Legal Obligation:</strong> Compliance with chemical regulations and safety laws</li>
                <li><strong>Legitimate Interests:</strong> Improving our services and preventing fraud</li>
                <li><strong>Consent:</strong> Marketing communications and optional features</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">5. Information Sharing and Disclosure</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                We may share your information with:
              </p>
              
              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">5.1 Service Providers</h3>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Payment processors</li>
                <li>Shipping and logistics companies</li>
                <li>Cloud hosting providers</li>
                <li>Analytics services</li>
                <li>Customer support platforms</li>
              </ul>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">5.2 Regulatory Authorities</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                We may disclose information to government agencies and regulatory bodies as required by law, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Chemical safety and environmental agencies</li>
                <li>Law enforcement when legally required</li>
                <li>Customs and border protection for international shipments</li>
                <li>Tax authorities</li>
              </ul>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">5.3 Business Transfers</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">6. Data Security</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Encrypted storage of sensitive information</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Employee training on data protection</li>
                <li>Secure backup systems</li>
              </ul>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-4">
                However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">7. Data Retention</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                We retain your information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Fulfill the purposes outlined in this policy</li>
                <li>Comply with legal and regulatory requirements (typically 7-10 years for chemical sales records)</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain business records</li>
              </ul>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">8. Your Privacy Rights</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for marketing communications</li>
              </ul>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@chemsupplypro.com
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">9. Cookies and Tracking Technologies</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Maintain your session and preferences</li>
                <li>Analyze website traffic and usage</li>
                <li>Improve user experience</li>
                <li>Deliver targeted content</li>
              </ul>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-4">
                You can control cookies through your browser settings. However, disabling cookies may limit functionality.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">10. Third-Party Links</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">11. International Data Transfers</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers, including standard contractual clauses and adequacy decisions.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">12. Children's Privacy</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Our services are intended for businesses only. We do not knowingly collect information from individuals under 18 years of age.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">13. Changes to This Privacy Policy</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our services constitutes acceptance of the updated policy.
              </p>
            </div>

            <div className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">14. Contact Us</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                For questions or concerns about this Privacy Policy or our data practices, please contact:
              </p>
              <ul className="list-none space-y-2 text-sm sm:text-base text-muted-foreground">
                <li><strong>Email:</strong> support@drchems.com</li>
                <li><strong>Phone:</strong> +1 (612) 293-1250</li>
                <li><strong>Address:</strong> 30 E 7th St, St Paul, MN 55101, United States</li>
              </ul>
            </div>

            <div className="bg-muted/50 p-4 sm:p-6 rounded-lg border border-border">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <strong>Your Privacy Matters:</strong> ChemSupply Pro is committed to transparency and protecting your personal information. We comply with applicable data protection laws including GDPR, CCPA, and other regional privacy regulations.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}


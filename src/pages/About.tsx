import qualityControlImage from "@/assets/quality-control.jpg";
import warehouseImage from "@/assets/warehouse.jpg";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const About = () => {
  const certifications = [
    "ISO 9001:2015 Quality Management",
    "ISO 14001:2015 Environmental Management",
    "OHSAS 18001 Occupational Health & Safety",
    "GMP Certified Manufacturing",
    "FDA Registered Facility",
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-muted/50 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">About ChemSupply Pro</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl">
            Trusted B2B supplier of industrial chemicals headquartered in St Paul, MN — serving businesses across the Minneapolis–St. Paul metro and worldwide since 2003.
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Our Story</h2>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2003, ChemSupply Pro has grown from a regional distributor to a 
                  trusted global supplier of high-quality industrial chemicals. Our commitment 
                  to quality, safety, and customer service has made us a preferred partner for 
                  businesses across manufacturing, agriculture, mining, and pharmaceutical industries.
                </p>
                <p>
                  We maintain strategic partnerships with leading chemical manufacturers worldwide, 
                  ensuring consistent supply of premium-grade products. Our state-of-the-art 
                  warehousing facilities and strict quality control protocols guarantee that every 
                  shipment meets international standards.
                </p>
                <p>
                  With a team of experienced chemical engineers and safety specialists, we provide 
                  not just products, but comprehensive technical support and compliance guidance to 
                  help your business succeed safely and responsibly.
                </p>
              </div>
            </div>
            <div>
              <img 
                src={warehouseImage} 
                alt="Our warehouse facility"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src={qualityControlImage}
                alt="Quality control laboratory"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Quality Assurance</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                Every product undergoes rigorous testing in our certified laboratories. We maintain 
                complete traceability from manufacturer to end-user, with full documentation including 
                Certificates of Analysis (COA) and Safety Data Sheets (SDS) for every batch.
              </p>
              <div className="space-y-3">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10 md:mb-12">Our Commitment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Safety First</h3>
                <p className="text-muted-foreground">
                  We prioritize the safety of our employees, customers, and communities. All products 
                  are handled according to strict safety protocols and international regulations.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Environmental Responsibility</h3>
                <p className="text-muted-foreground">
                  Committed to sustainable practices and minimizing environmental impact through 
                  responsible sourcing and waste management.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Customer Success</h3>
                <p className="text-muted-foreground">
                  Your success is our success. We provide ongoing technical support, compliance 
                  guidance, and supply chain reliability.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

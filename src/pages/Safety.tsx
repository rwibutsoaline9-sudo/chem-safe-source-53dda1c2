import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { AlertTriangle, FileCheck, Lock, Shield } from "lucide-react";

const Safety = () => {
  const restrictedChemicals = [
    {
      name: "Sodium Cyanide 98%",
      restrictions: "Requires mining or electroplating license, EUC verification",
      documentation: "Business license, intended use declaration, facility inspection certificate",
    },
    {
      name: "Methylamine 40%",
      restrictions: "Controlled precursor - requires DEA registration in USA",
      documentation: "DEA registration, import/export license, end-use certification",
    },
    {
      name: "Phenylacetonitrile",
      restrictions: "Pharmaceutical precursor - regulated in most jurisdictions",
      documentation: "Pharmaceutical manufacturing license, facility compliance certificate",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-muted/50 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Safety & Compliance</h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl">
            Committed to safe trade practices and regulatory compliance
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Alert className="mb-8 sm:mb-10 md:mb-12 border-primary/50 bg-primary/5">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <AlertTitle className="text-base sm:text-lg font-semibold">Important Notice</AlertTitle>
            <AlertDescription className="text-sm sm:text-base mt-2">
              ChemSupply Pro operates in full compliance with international chemical regulations including 
              REACH, CLP, and local jurisdiction requirements. All sales are business-to-business only. 
              We do not supply to individuals or unverified entities.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12 md:mb-16">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileCheck className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl font-bold">Required Documentation</h2>
                </div>
                <div className="space-y-3 text-muted-foreground">
                  <p>All customers must provide:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Valid business registration documents</li>
                    <li>Tax identification number</li>
                    <li>Facility address and contact information</li>
                    <li>Intended use declaration for all products</li>
                    <li>Relevant operating licenses (industry-specific)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl font-bold">KYC Verification</h2>
                </div>
                <div className="space-y-3 text-muted-foreground">
                  <p>Our Know Your Customer process ensures:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Verification of business legitimacy</li>
                    <li>Compliance with anti-money laundering regulations</li>
                    <li>End-use verification for controlled substances</li>
                    <li>Ongoing customer due diligence</li>
                    <li>Secure document storage and handling</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Restricted Chemicals</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              The following products have additional regulatory requirements and purchasing restrictions:
            </p>
            <div className="space-y-6">
              {restrictedChemicals.map((chemical, index) => (
                <Card key={index} className="border-destructive/30">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{chemical.name}</h3>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-semibold text-foreground">Restrictions: </span>
                            <span className="text-muted-foreground">{chemical.restrictions}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Required Documentation: </span>
                            <span className="text-muted-foreground">{chemical.documentation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Safety Data Sheets (SDS)</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  Safety Data Sheets are provided for all products and contain critical information including:
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Hazard identification</li>
                    <li>Composition and ingredients</li>
                    <li>First-aid measures</li>
                    <li>Fire-fighting measures</li>
                  </ul>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Handling and storage procedures</li>
                    <li>Exposure controls and PPE</li>
                    <li>Physical and chemical properties</li>
                    <li>Disposal considerations</li>
                  </ul>
                </div>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold text-foreground">
                    Note: SDS documents are available for download after quote request verification. 
                    Always consult the SDS before handling any chemical product.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Safety;

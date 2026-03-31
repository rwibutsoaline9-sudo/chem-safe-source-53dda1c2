import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Mail, MapPin, MessageCircle, Phone, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    product: "",
    quantity: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Quote request submitted successfully! We'll contact you within 24 hours.");
    setFormData({
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      product: "",
      quantity: "",
      message: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-muted/50 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">Request a Quote</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Get competitive pricing and expert guidance for your chemical needs
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quote Request Form</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input id="businessName" name="businessName" required value={formData.businessName} onChange={handleChange} placeholder="Your Company Ltd." />
                      </div>
                      <div>
                        <Label htmlFor="contactName">Contact Name *</Label>
                        <Input id="contactName" name="contactName" required value={formData.contactName} onChange={handleChange} placeholder="John Doe" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="contact@company.com" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="product">Product of Interest *</Label>
                        <Input id="product" name="product" required value={formData.product} onChange={handleChange} placeholder="e.g., Urea 46% N" />
                      </div>
                      <div>
                        <Label htmlFor="quantity">Required Quantity *</Label>
                        <Input id="quantity" name="quantity" required value={formData.quantity} onChange={handleChange} placeholder="e.g., 10 MT, 500 bags" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="message">Additional Information</Label>
                      <Textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Delivery location, timeline, special requirements..." rows={4} />
                    </div>
                    <div>
                      <Label>Business License / KYC Documents</Label>
                      <div className="mt-2 flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PDF, PNG, JPG up to 10MB</p>
                          </div>
                          <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Required for restricted chemicals. Accelerates quote processing.
                      </p>
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                      Submit Quote Request
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <a href="mailto:support@drchems.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">support@drchems.com</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold">Phone</p>
                      <a href="tel:+16122931250" className="text-sm text-muted-foreground hover:text-primary transition-colors">+1 (612) 293-1250</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-[hsl(142,70%,45%)] mt-0.5" />
                    <div>
                      <p className="font-semibold">WhatsApp</p>
                      <a
                        href="https://wa.me/16122931250?text=Hello%20ChemSupply%20Pro%2C%20I%27m%20interested%20in%20your%20products."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        +1 (612) 293-1250
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold">Office Address</p>
                      <p className="text-sm text-muted-foreground">
                        30 E 7th St<br />
                        St Paul, MN 55101<br />
                        United States
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    We typically respond to quote requests within 24 business hours. Restricted chemicals
                    may require additional verification time.
                  </p>
                  <p className="text-sm font-semibold">
                    Business Hours: Monday–Friday, 8 AM – 6 PM CST
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">
                    <strong>B2B Only:</strong> ChemSupply Pro exclusively serves verified businesses. All orders require business registration and KYC documentation before processing.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

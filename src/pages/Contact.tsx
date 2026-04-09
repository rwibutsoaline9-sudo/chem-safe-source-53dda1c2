import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, CreditCard, Mail, MapPin, MessageCircle, Phone, Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    product: "",
    quantity: "",
    message: "",
  });
  const [showPayment, setShowPayment] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Save quote to DB
    const { error } = await supabase.from("contact_messages").insert({
      business_name: formData.businessName,
      contact_name: formData.contactName,
      email: formData.email,
      phone: formData.phone,
      product: formData.product,
      quantity: formData.quantity,
      message: formData.message,
    });

    if (error) {
      toast.error("Failed to submit quote request");
      return;
    }

    toast.success("Quote request submitted! You can now proceed to payment.");
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayNow = () => {
    if (!quoteAmount || quoteAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    const params = new URLSearchParams({
      amount: quoteAmount.toString(),
      email: formData.email,
      product: formData.product,
      quantity: formData.quantity,
    });
    navigate(`/checkout?${params.toString()}`);
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
              {submitted ? (
                <PaymentPrompt
                  formData={formData}
                  quoteAmount={quoteAmount}
                  onAmountChange={setQuoteAmount}
                  onPayNow={handlePayNow}
                  onNewQuote={() => {
                    setSubmitted(false);
                    setFormData({
                      businessName: "", contactName: "", email: "", phone: "",
                      product: "", quantity: "", message: "",
                    });
                  }}
                />
              ) : (
                <QuoteForm formData={formData} onChange={handleChange} onSubmit={handleSubmit} />
              )}
            </div>
            <ContactSidebar />
          </div>
        </div>
      </section>
    </div>
  );
};

// ── Sub-components ──

const QuoteForm = ({
  formData,
  onChange,
  onSubmit,
}: {
  formData: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Quote Request Form</CardTitle>
    </CardHeader>
    <CardContent>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="businessName">Business Name *</Label>
            <Input id="businessName" name="businessName" required value={formData.businessName} onChange={onChange} placeholder="Your Company Ltd." />
          </div>
          <div>
            <Label htmlFor="contactName">Contact Name *</Label>
            <Input id="contactName" name="contactName" required value={formData.contactName} onChange={onChange} placeholder="John Doe" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input id="email" name="email" type="email" required value={formData.email} onChange={onChange} placeholder="contact@company.com" />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input id="phone" name="phone" type="tel" required value={formData.phone} onChange={onChange} placeholder="+1 (555) 000-0000" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="product">Product of Interest *</Label>
            <Input id="product" name="product" required value={formData.product} onChange={onChange} placeholder="e.g., Urea 46% N" />
          </div>
          <div>
            <Label htmlFor="quantity">Required Quantity *</Label>
            <Input id="quantity" name="quantity" required value={formData.quantity} onChange={onChange} placeholder="e.g., 10 MT, 500 bags" />
          </div>
        </div>
        <div>
          <Label htmlFor="message">Additional Information</Label>
          <Textarea id="message" name="message" value={formData.message} onChange={onChange} placeholder="Delivery location, timeline, special requirements..." rows={4} />
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
);

const PaymentPrompt = ({
  formData,
  quoteAmount,
  onAmountChange,
  onPayNow,
  onNewQuote,
}: {
  formData: Record<string, string>;
  quoteAmount: number;
  onAmountChange: (amount: number) => void;
  onPayNow: () => void;
  onNewQuote: () => void;
}) => (
  <Card className="border-primary/20">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        Quote Submitted — Ready to Pay
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="rounded-lg bg-muted/50 p-4 space-y-2">
        <p className="text-sm"><strong>Business:</strong> {formData.businessName}</p>
        <p className="text-sm"><strong>Contact:</strong> {formData.contactName}</p>
        <p className="text-sm"><strong>Product:</strong> {formData.product}</p>
        <p className="text-sm"><strong>Quantity:</strong> {formData.quantity}</p>
      </div>

      <div>
        <Label htmlFor="amount">Payment Amount (USD) *</Label>
        <Input
          id="amount"
          type="number"
          min="0.50"
          step="0.01"
          value={quoteAmount || ""}
          onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
          placeholder="Enter the agreed amount"
          className="text-lg font-semibold"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter the amount agreed upon in your quote
        </p>
      </div>

      <Button onClick={onPayNow} size="lg" className="w-full">
        <CreditCard className="mr-2 h-4 w-4" />
        Pay with Credit Card
      </Button>

      <Button variant="ghost" className="w-full" onClick={onNewQuote}>
        Submit Another Quote
      </Button>
    </CardContent>
  </Card>
);

const ContactSidebar = () => (
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
);

export default Contact;

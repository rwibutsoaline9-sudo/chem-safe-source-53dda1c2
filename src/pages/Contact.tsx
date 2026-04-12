import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, CreditCard, Mail, MapPin, MessageCircle, Phone, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DBProduct {
  id: string;
  name: string;
  price_value: number;
  price_unit: string;
  price_currency: string;
}

const Contact = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    productId: "",
    quantity: 1,
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price_value, price_unit, price_currency")
        .order("name");
      if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  const selectedProduct = products.find((p) => p.id === formData.productId);
  const totalPrice = selectedProduct ? selectedProduct.price_value * formData.quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    if (formData.quantity <= 0) {
      toast.error("Quantity must be at least 1");
      return;
    }

    const { error } = await supabase.from("contact_messages").insert({
      business_name: formData.businessName,
      contact_name: formData.contactName,
      email: formData.email,
      phone: formData.phone,
      product: selectedProduct.name,
      quantity: String(formData.quantity),
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Math.max(1, parseInt(value) || 1) : value,
    }));
  };

  const handlePayNow = (percentage: number) => {
    if (!selectedProduct) return;
    const payAmount = totalPrice * (percentage / 100);
    const params = new URLSearchParams({
      amount: payAmount.toFixed(2),
      email: formData.email,
      product: selectedProduct.name,
      quantity: String(formData.quantity),
      unitPrice: selectedProduct.price_value.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      plan: String(percentage),
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
                <PaymentOptions
                  selectedProduct={selectedProduct!}
                  quantity={formData.quantity}
                  totalPrice={totalPrice}
                  onPayNow={handlePayNow}
                  onNewQuote={() => {
                    setSubmitted(false);
                    setFormData({
                      businessName: "", contactName: "", email: "", phone: "",
                      productId: "", quantity: 1, message: "",
                    });
                  }}
                  formData={formData}
                />
              ) : (
                <QuoteForm
                  formData={formData}
                  products={products}
                  selectedProduct={selectedProduct}
                  totalPrice={totalPrice}
                  onChange={handleChange}
                  onProductChange={(id) => setFormData((prev) => ({ ...prev, productId: id }))}
                  onSubmit={handleSubmit}
                />
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
  products,
  selectedProduct,
  totalPrice,
  onChange,
  onProductChange,
  onSubmit,
}: {
  formData: Record<string, any>;
  products: DBProduct[];
  selectedProduct: DBProduct | undefined;
  totalPrice: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onProductChange: (id: string) => void;
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
            <Label>Product of Interest *</Label>
            <Select value={formData.productId} onValueChange={onProductChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — ${p.price_value.toLocaleString()}/{p.price_unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="quantity">Required Quantity *</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              required
              value={formData.quantity}
              onChange={onChange}
              placeholder="e.g., 10"
            />
            {selectedProduct && (
              <p className="text-xs text-muted-foreground mt-1">
                Unit: {selectedProduct.price_unit}
              </p>
            )}
          </div>
        </div>

        {/* Price Summary */}
        {selectedProduct && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-muted-foreground">Unit Price</span>
                <span className="font-medium">${selectedProduct.price_value.toLocaleString()} / {selectedProduct.price_unit}</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">× {formData.quantity}</span>
              </div>
              <div className="border-t border-primary/20 pt-2 flex justify-between items-center">
                <span className="font-semibold">Estimated Total</span>
                <span className="text-xl font-bold text-primary">${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>
        )}

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
        <Button type="submit" size="lg" className="w-full" disabled={!formData.productId}>
          Submit Quote Request
        </Button>
      </form>
    </CardContent>
  </Card>
);

const PaymentOptions = ({
  selectedProduct,
  quantity,
  totalPrice,
  onPayNow,
  onNewQuote,
  formData,
}: {
  selectedProduct: DBProduct;
  quantity: number;
  totalPrice: number;
  onPayNow: (percentage: number) => void;
  onNewQuote: () => void;
  formData: Record<string, any>;
}) => {
  const plans = [
    {
      percentage: 20,
      label: "Sample Deposit",
      description: "Pay 20% for product sample evaluation before committing to the full order.",
      includes: ["Product sample shipment", "Quality evaluation period"],
      color: "border-blue-500/30 bg-blue-500/5",
      badge: "Starter",
      badgeColor: "bg-blue-500/10 text-blue-700",
    },
    {
      percentage: 50,
      label: "Sample + Half Order",
      description: "Pay 50% to receive the sample plus half of your ordered quantity.",
      includes: ["Product sample shipment", "50% of ordered quantity", "Quality evaluation period"],
      color: "border-primary/30 bg-primary/5",
      badge: "Popular",
      badgeColor: "bg-primary/10 text-primary",
    },
    {
      percentage: 100,
      label: "Full Order + Certificate",
      description: "Pay 100% for the complete order including sample, full quantity, and certificate of analysis.",
      includes: ["Product sample shipment", "Full ordered quantity", "Certificate of Analysis (COA)", "Priority processing"],
      color: "border-green-500/30 bg-green-500/5",
      badge: "Best Value",
      badgeColor: "bg-green-500/10 text-green-700",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Submitted Successfully</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-sm"><strong>Business:</strong> {formData.businessName}</p>
            <p className="text-sm"><strong>Contact:</strong> {formData.contactName}</p>
            <p className="text-sm"><strong>Product:</strong> {selectedProduct.name}</p>
            <p className="text-sm"><strong>Quantity:</strong> {quantity} × ${selectedProduct.price_value.toLocaleString()}/{selectedProduct.price_unit}</p>
            <div className="border-t border-border pt-2 mt-2">
              <p className="text-lg font-bold">Total: ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Plans */}
      <h3 className="text-xl font-bold">Choose Your Payment Plan</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const payAmount = totalPrice * (plan.percentage / 100);
          return (
            <Card key={plan.percentage} className={`relative ${plan.color} hover:shadow-lg transition-shadow`}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>
                  <span className="text-2xl font-bold">{plan.percentage}%</span>
                </div>
                <h4 className="font-semibold text-lg">{plan.label}</h4>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <ul className="space-y-1.5">
                  {plan.includes.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">✓</span> {item}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border pt-3">
                  <p className="text-2xl font-bold text-primary">
                    ${payAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {plan.percentage < 100
                      ? `Remaining: $${(totalPrice - payAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                      : "Nothing more to pay"}
                  </p>
                </div>
                <Button onClick={() => onPayNow(plan.percentage)} className="w-full" size="lg">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay ${payAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button variant="ghost" className="w-full" onClick={onNewQuote}>
        Submit Another Quote
      </Button>
    </div>
  );
};

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

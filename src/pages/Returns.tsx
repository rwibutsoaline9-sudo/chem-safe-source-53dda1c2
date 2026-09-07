import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { RotateCcw, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const REASONS = [
  "Damaged in transit",
  "Wrong product received",
  "Wrong quantity received",
  "Product out of specification",
  "Container leak or seal failure",
  "Documentation missing (SDS / CoA)",
  "Shipment never arrived",
  "Order cancelled before shipment",
  "Other",
] as const;

const RESOLUTIONS = [
  { value: "refund", label: "Refund to original payment method" },
  { value: "replacement", label: "Replacement shipment" },
  { value: "credit", label: "Account credit for a future order" },
  { value: "other", label: "Other (explain below)" },
] as const;

const refundSchema = z.object({
  order_reference: z
    .string()
    .trim()
    .min(1, { message: "Order or invoice number is required" })
    .max(100, { message: "Order reference must be under 100 characters" }),
  customer_name: z
    .string()
    .trim()
    .min(2, { message: "Please enter your full name" })
    .max(120, { message: "Name must be under 120 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Enter a valid email address" })
    .max(255, { message: "Email must be under 255 characters" }),
  phone: z.string().trim().max(40, { message: "Phone must be under 40 characters" }).optional(),
  product_name: z
    .string()
    .trim()
    .min(2, { message: "Please name the product" })
    .max(200, { message: "Product name must be under 200 characters" }),
  quantity: z.string().trim().max(80, { message: "Quantity must be under 80 characters" }).optional(),
  purchase_date: z.string().trim().max(20).optional(),
  reason: z.string().trim().min(1, { message: "Please choose a reason" }).max(200),
  preferred_resolution: z.enum(["refund", "replacement", "credit", "other"]),
  details: z
    .string()
    .trim()
    .max(3000, { message: "Details must be under 3000 characters" })
    .optional(),
});

type FormState = {
  order_reference: string;
  customer_name: string;
  email: string;
  phone: string;
  product_name: string;
  quantity: string;
  purchase_date: string;
  reason: string;
  preferred_resolution: "refund" | "replacement" | "credit" | "other";
  details: string;
};

const EMPTY_FORM: FormState = {
  order_reference: "",
  customer_name: "",
  email: "",
  phone: "",
  product_name: "",
  quantity: "",
  purchase_date: "",
  reason: "",
  preferred_resolution: "refund",
  details: "",
};

export default function Returns() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = refundSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setSubmitting(true);
    const d = parsed.data;
    const { error } = await supabase.from("refund_requests").insert({
      order_reference: d.order_reference,
      customer_name: d.customer_name,
      email: d.email,
      phone: d.phone ? d.phone : null,
      product_name: d.product_name,
      quantity: d.quantity ? d.quantity : null,
      purchase_date: d.purchase_date ? d.purchase_date : null,
      reason: d.reason,
      preferred_resolution: d.preferred_resolution,
      details: d.details ? d.details : null,
      status: "new",
    });
    setSubmitting(false);

    if (error) {
      toast.error("We could not send your request. Please try again or email us directly.");
      return;
    }

    setForm(EMPTY_FORM);
    setSubmitted(true);
    toast.success("Refund request received — our team will reply within 2 business days.");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Returns & Refunds — ChemSupply Pro"
        description="Request a refund, replacement or credit for an industrial chemical order. Submit your order number and we respond within 2 business days."
        path="/returns"
      />

      <section className="bg-muted/50 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { name: "Home", path: "/" },
                { name: "Returns & Refunds", path: "/returns" },
              ]}
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              Returns &amp; Refunds
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl">
            Tell us what went wrong with your order. Every request is reviewed by a compliance
            specialist and answered within 2 business days.
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Alert className="mb-8 border-primary/50 bg-primary/5">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <AlertTitle className="text-base sm:text-lg font-semibold">
              Never return chemicals without written authorisation
            </AlertTitle>
            <AlertDescription className="text-sm sm:text-base mt-2">
              Hazardous materials may only be shipped back after we issue a return authorisation
              number and hazmat paperwork. Keep the product sealed in its original packaging, store
              it per the SDS, and photograph any damage before submitting this form.
            </AlertDescription>
          </Alert>

          {submitted ? (
            <Card className="border-primary/40">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                  <CardTitle className="text-xl sm:text-2xl">Request received</CardTitle>
                </div>
                <CardDescription className="text-sm sm:text-base">
                  A specialist will email you within 2 business days with a decision or a request
                  for photos and batch documentation. If your material is leaking or unstable, call
                  us immediately instead of waiting for the reply.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Submit another request
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Refund request form</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Requests must be filed within 30 days of delivery. Fields marked * are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="order_reference">Order or invoice number *</Label>
                      <Input
                        id="order_reference"
                        value={form.order_reference}
                        onChange={(e) => set("order_reference", e.target.value)}
                        maxLength={100}
                        placeholder="e.g. INV-10428"
                        aria-invalid={!!errors.order_reference}
                      />
                      {errors.order_reference && (
                        <p className="text-sm text-destructive">{errors.order_reference}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchase_date">Purchase or delivery date</Label>
                      <Input
                        id="purchase_date"
                        type="date"
                        value={form.purchase_date}
                        onChange={(e) => set("purchase_date", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customer_name">Your full name *</Label>
                      <Input
                        id="customer_name"
                        value={form.customer_name}
                        onChange={(e) => set("customer_name", e.target.value)}
                        maxLength={120}
                        aria-invalid={!!errors.customer_name}
                      />
                      {errors.customer_name && (
                        <p className="text-sm text-destructive">{errors.customer_name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        maxLength={255}
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        maxLength={40}
                        placeholder="Optional, for urgent cases"
                      />
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product_name">Product name *</Label>
                      <Input
                        id="product_name"
                        value={form.product_name}
                        onChange={(e) => set("product_name", e.target.value)}
                        maxLength={200}
                        placeholder="e.g. Sulfuric Acid 98%"
                        aria-invalid={!!errors.product_name}
                      />
                      {errors.product_name && (
                        <p className="text-sm text-destructive">{errors.product_name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity affected</Label>
                      <Input
                        id="quantity"
                        value={form.quantity}
                        onChange={(e) => set("quantity", e.target.value)}
                        maxLength={80}
                        placeholder="e.g. 2 x 200 L drums"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for the request *</Label>
                      <Select value={form.reason} onValueChange={(v) => set("reason", v)}>
                        <SelectTrigger id="reason" aria-invalid={!!errors.reason}>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {REASONS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.reason && <p className="text-sm text-destructive">{errors.reason}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferred_resolution">What would you like us to do? *</Label>
                    <Select
                      value={form.preferred_resolution}
                      onValueChange={(v) => set("preferred_resolution", v)}
                    >
                      <SelectTrigger id="preferred_resolution">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RESOLUTIONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details">What happened?</Label>
                    <Textarea
                      id="details"
                      value={form.details}
                      onChange={(e) => set("details", e.target.value)}
                      maxLength={3000}
                      rows={6}
                      placeholder="Describe the issue, batch/lot number, seal condition and how the material is currently stored."
                    />
                    <p className="text-xs text-muted-foreground">
                      {form.details.length}/3000 characters
                    </p>
                    {errors.details && <p className="text-sm text-destructive">{errors.details}</p>}
                  </div>

                  <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending request…
                      </>
                    ) : (
                      "Submit refund request"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="mt-10 sm:mt-14 space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3">How the process works</h2>
              <ol className="list-decimal pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>You submit this form within 30 days of delivery.</li>
                <li>
                  A compliance specialist reviews the request and may ask for photos, the batch
                  number or the certificate of analysis.
                </li>
                <li>
                  If a physical return is required, we issue a return authorisation number and the
                  hazmat documentation. Never ship without it.
                </li>
                <li>
                  Approved refunds are issued to the original payment method within 5–10 business
                  days of us receiving and inspecting the material.
                </li>
              </ol>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3">What we cannot accept</h2>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Opened, decanted, diluted or repackaged containers.</li>
                <li>
                  Custom-blended, made-to-order or restricted products, unless they arrived damaged
                  or out of specification.
                </li>
                <li>Material stored outside the conditions stated on the SDS.</li>
                <li>Requests filed more than 30 days after delivery.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

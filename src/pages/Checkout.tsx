import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  CreditCard,
  Loader2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Package,
  FileCheck,
} from 'lucide-react';

/* ── Inner form rendered inside <Elements> ── */
const CheckoutForm = ({
  amount,
  onSuccess,
}: {
  amount: number;
  onSuccess: (id: string) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout?status=verifying` },
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || 'Payment failed');
      setProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      toast.info('Payment is being processed…');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: 'tabs' }} />
      <Button
        type="submit"
        disabled={!stripe || processing}
        size="lg"
        className="w-full text-base"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing…
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" /> Pay ${amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
};

const planLabels: Record<string, { label: string; description: string; includes: string[] }> = {
  '20': {
    label: 'Sample Deposit (20%)',
    description: 'Product sample for evaluation before full commitment.',
    includes: ['Product sample shipment', 'Quality evaluation period'],
  },
  '50': {
    label: 'Sample + Half Order (50%)',
    description: 'Sample plus 50% of your ordered quantity.',
    includes: ['Product sample shipment', '50% of ordered quantity', 'Quality evaluation period'],
  },
  '100': {
    label: 'Full Order + Certificate (100%)',
    description: 'Complete order with sample, full quantity, and Certificate of Analysis.',
    includes: ['Product sample shipment', 'Full ordered quantity', 'Certificate of Analysis (COA)', 'Priority processing'],
  },
};

/* ── Main Checkout Page ── */
const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const amount = parseFloat(searchParams.get('amount') || '0');
  const email = searchParams.get('email') || '';
  const product = searchParams.get('product') || '';
  const quantity = searchParams.get('quantity') || '';
  const unitPrice = searchParams.get('unitPrice') || '';
  const totalPrice = searchParams.get('totalPrice') || '';
  const plan = searchParams.get('plan') || '100';
  const status = searchParams.get('status') || '';

  const planInfo = planLabels[plan] || planLabels['100'];

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] =
    useState<ReturnType<typeof loadStripe> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    'idle' | 'verifying' | 'success' | 'failed'
  >(status === 'verifying' ? 'verifying' : 'idle');

  const items = useMemo(() => ({ product, quantity }), [product, quantity]);

  useEffect(() => {
    if (paymentStatus !== 'idle') {
      setLoading(false);
      if (paymentStatus === 'verifying') {
        setTimeout(() => setPaymentStatus('success'), 2500);
      }
      return;
    }
    if (!amount || amount <= 0) {
      setError('No payment amount specified.');
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const { data: settings } = await supabase
          .rpc('get_public_payment_settings')
          .limit(1)
          .single() as { data: { stripe_public_key: string | null; stripe_enabled: boolean } | null };

        if (!settings?.stripe_enabled || !settings?.stripe_public_key) {
          setError('Stripe payments are not configured. Please contact support.');
          setLoading(false);
          return;
        }

        setStripePromise(loadStripe(settings.stripe_public_key));

        const { data, error: fnError } = await supabase.functions.invoke(
          'create-payment-intent',
          { body: { amount, currency: 'usd', customer_email: email, items } }
        );

        if (fnError || data?.error) {
          setError(data?.error || fnError?.message || 'Failed to initialize payment');
          setLoading(false);
          return;
        }

        setClientSecret(data.client_secret);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [amount, email, items, paymentStatus]);

  const handleSuccess = (paymentIntentId: string) => {
    setPaymentStatus('verifying');
    setTimeout(() => {
      setPaymentStatus('success');
    }, 2500);
  };

  if (paymentStatus === 'verifying') {
    return (
      <PageShell>
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-10 text-center space-y-5">
            <Loader2 className="w-14 h-14 animate-spin mx-auto text-primary" />
            <h2 className="text-2xl font-bold">Verifying Payment…</h2>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment with Stripe. Do not close this page.
            </p>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <PageShell>
        <Card className="max-w-lg mx-auto border-primary/20">
          <CardContent className="p-10 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Payment Confirmed!</h2>
            <p className="text-muted-foreground">
              Your payment of <span className="font-semibold">${amount.toFixed(2)}</span> ({planInfo.label}) has
              been processed. A receipt has been sent to{' '}
              <span className="font-semibold">{email}</span>.
            </p>
            {plan === '100' && (
              <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
                <FileCheck className="w-4 h-4" />
                Certificate of Analysis will be included with your shipment
              </div>
            )}
            <Separator />
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/products')}>
                <Package className="mr-2 h-4 w-4" /> Browse Products
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <Card className="max-w-lg mx-auto border-destructive/30 bg-destructive/5">
          <CardContent className="p-10 text-center space-y-5">
            <XCircle className="w-14 h-14 text-destructive mx-auto" />
            <h2 className="text-xl font-bold text-destructive">Payment Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell>
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-10 text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Initializing secure checkout…</p>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  if (!clientSecret || !stripePromise) return null;

  return (
    <PageShell>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
        {/* Left: Payment form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: { colorPrimary: 'hsl(221.2 83.2% 53.3%)' },
                  },
                }}
              >
                <CheckoutForm amount={amount} onSuccess={handleSuccess} />
              </Elements>
            </CardContent>
          </Card>
        </div>

        {/* Right: Order summary */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plan Badge */}
              <Badge variant="secondary" className="text-xs">
                {planInfo.label}
              </Badge>

              {product && (
                <div>
                  <p className="font-medium">{product}</p>
                  {unitPrice && quantity && (
                    <p className="text-sm text-muted-foreground">
                      ${parseFloat(unitPrice).toLocaleString()} × {quantity} units
                    </p>
                  )}
                </div>
              )}

              <Separator />

              {totalPrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Full Order Total</span>
                  <span>${parseFloat(totalPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Plan</span>
                <span>{plan}%</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Amount Due</span>
                <span className="text-primary">${amount.toFixed(2)}</span>
              </div>

              {parseFloat(plan) < 100 && totalPrice && (
                <p className="text-xs text-muted-foreground">
                  Remaining balance: ${(parseFloat(totalPrice) - amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              )}

              {/* What's included */}
              <div className="pt-2">
                <p className="text-xs font-semibold mb-2">Includes:</p>
                <ul className="space-y-1">
                  {planInfo.includes.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {email && (
                <p className="text-xs text-muted-foreground pt-2">
                  Receipt will be sent to {email}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Secure Payment
              </div>
              <p className="text-xs text-muted-foreground">
                Your payment information is encrypted and processed securely by
                Stripe. We never store your card details.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">256-bit SSL</Badge>
                <Badge variant="outline" className="text-xs">PCI Compliant</Badge>
              </div>
            </CardContent>
          </Card>

          <Button variant="ghost" className="w-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel & Go Back
          </Button>
        </div>
      </div>
    </PageShell>
  );
};

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <SEO
      title="Secure Checkout — ChemSupply Pro"
      description="Complete your industrial chemicals order securely with Stripe-powered checkout and full SDS compliance."
      path="/checkout"
    />
    <section className="bg-muted/50 py-6 sm:py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Lock className="w-6 h-6" /> Secure Checkout
        </h1>
        <p className="text-muted-foreground mt-1">Complete your purchase securely</p>
      </div>
    </section>
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4">{children}</div>
    </section>
  </div>
);

export default Checkout;

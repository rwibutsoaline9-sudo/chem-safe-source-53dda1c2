import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface StripeCheckoutProps {
  amount: number;
  customerEmail: string;
  items: { product: string; quantity: string };
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

const CheckoutForm = ({ onSuccess }: { onSuccess: (id: string) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin },
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || 'Payment failed');
      setProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      toast.success('Payment confirmed!');
      onSuccess(paymentIntent.id);
    } else {
      toast.info('Payment is being processed...');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || processing} className="w-full" size="lg">
        {processing ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
        ) : (
          <><CreditCard className="mr-2 h-4 w-4" /> Pay Now</>
        )}
      </Button>
    </form>
  );
};

const StripeCheckout = ({ amount, customerEmail, items, onSuccess, onCancel }: StripeCheckoutProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Get publishable key from payment_settings
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

        // Create payment intent via edge function
        const { data, error: fnError } = await supabase.functions.invoke('create-payment-intent', {
          body: { amount, currency: 'usd', customer_email: customerEmail, items },
        });

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
  }, [amount, customerEmail, items]);

  const handleSuccess = (paymentIntentId: string) => {
    setPaymentSuccess(true);
    onSuccess(paymentIntentId);
  };

  if (paymentSuccess) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h3 className="text-xl font-bold">Payment Confirmed!</h3>
          <p className="text-muted-foreground">
            Your payment of ${amount.toFixed(2)} has been processed successfully. 
            You'll receive a confirmation email at {customerEmail}.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Initializing secure payment...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-8 text-center space-y-4">
          <XCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-destructive font-semibold">{error}</p>
          <Button variant="outline" onClick={onCancel}>Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret || !stripePromise) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Pay ${amount.toFixed(2)} USD
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <CheckoutForm onSuccess={handleSuccess} />
        </Elements>
        <Button variant="ghost" className="w-full" onClick={onCancel}>
          Cancel Payment
        </Button>
      </CardContent>
    </Card>
  );
};

export default StripeCheckout;

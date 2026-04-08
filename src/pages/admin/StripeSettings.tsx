import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreditCard, Eye, EyeOff, Save, Shield, Zap } from 'lucide-react';

interface PaymentSettings {
  id: string;
  stripe_enabled: boolean;
  stripe_public_key: string | null;
  stripe_secret_key: string | null;
  stripe_mode: string;
  webhook_secret: string | null;
  subscriptions_enabled: boolean;
  one_time_enabled: boolean;
  paypal_enabled: boolean;
  paypal_client_id: string | null;
  paypal_secret: string | null;
  crypto_enabled: boolean;
  crypto_provider: string | null;
  crypto_api_key: string | null;
}

const StripeSettings = () => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      toast.error('Failed to load payment settings');
      console.error(error);
    }

    if (data) {
      setSettings(data as PaymentSettings);
    } else {
      // Create default settings
      const { data: newData, error: insertError } = await supabase
        .from('payment_settings')
        .insert({
          stripe_enabled: false,
          stripe_mode: 'test',
          one_time_enabled: true,
          subscriptions_enabled: false,
        })
        .select()
        .single();

      if (!insertError && newData) {
        setSettings(newData as PaymentSettings);
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);

    const { error } = await supabase
      .from('payment_settings')
      .update({
        stripe_enabled: settings.stripe_enabled,
        stripe_public_key: settings.stripe_public_key,
        stripe_secret_key: settings.stripe_secret_key,
        stripe_mode: settings.stripe_mode,
        webhook_secret: settings.webhook_secret,
        subscriptions_enabled: settings.subscriptions_enabled,
        one_time_enabled: settings.one_time_enabled,
        paypal_enabled: settings.paypal_enabled,
        paypal_client_id: settings.paypal_client_id,
        paypal_secret: settings.paypal_secret,
        crypto_enabled: settings.crypto_enabled,
        crypto_provider: settings.crypto_provider,
        crypto_api_key: settings.crypto_api_key,
      })
      .eq('id', settings.id);

    if (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } else {
      // Log the action
      await supabase.from('audit_logs').insert({
        action: 'payment_settings_updated',
        data: { stripe_enabled: settings.stripe_enabled, stripe_mode: settings.stripe_mode },
      });
      toast.success('Payment settings saved successfully');
    }
    setSaving(false);
  };

  const updateField = (field: keyof PaymentSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading settings...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Payment Settings</h1>
            <p className="text-muted-foreground mt-1">Configure your payment providers and options</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Stripe Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>Stripe</CardTitle>
                    <CardDescription>Accept credit/debit card payments</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={settings?.stripe_mode === 'live' ? 'default' : 'secondary'}>
                    {settings?.stripe_mode === 'live' ? 'LIVE' : 'TEST'}
                  </Badge>
                  <Switch
                    checked={settings?.stripe_enabled ?? false}
                    onCheckedChange={(v) => updateField('stripe_enabled', v)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="w-24">Mode</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={settings?.stripe_mode === 'test' ? 'default' : 'outline'}
                    onClick={() => updateField('stripe_mode', 'test')}
                  >
                    Test
                  </Button>
                  <Button
                    size="sm"
                    variant={settings?.stripe_mode === 'live' ? 'default' : 'outline'}
                    onClick={() => updateField('stripe_mode', 'live')}
                  >
                    Live
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Publishable Key</Label>
                <Input
                  placeholder="pk_test_... or pk_live_..."
                  value={settings?.stripe_public_key ?? ''}
                  onChange={(e) => updateField('stripe_public_key', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Secret Key</Label>
                <div className="relative">
                  <Input
                    type={showSecretKey ? 'text' : 'password'}
                    placeholder="sk_test_... or sk_live_..."
                    value={settings?.stripe_secret_key ?? ''}
                    onChange={(e) => updateField('stripe_secret_key', e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                  >
                    {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <div className="relative">
                  <Input
                    type={showWebhookSecret ? 'text' : 'password'}
                    placeholder="whsec_..."
                    value={settings?.webhook_secret ?? ''}
                    onChange={(e) => updateField('webhook_secret', e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  >
                    {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get this from your Stripe Dashboard → Developers → Webhooks
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Types */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Payment Types</CardTitle>
                  <CardDescription>Choose which payment types to accept</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">One-Time Payments</p>
                  <p className="text-sm text-muted-foreground">Accept single payment charges</p>
                </div>
                <Switch
                  checked={settings?.one_time_enabled ?? true}
                  onCheckedChange={(v) => updateField('one_time_enabled', v)}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Subscriptions</p>
                  <p className="text-sm text-muted-foreground">Accept recurring subscription payments</p>
                </div>
                <Switch
                  checked={settings?.subscriptions_enabled ?? false}
                  onCheckedChange={(v) => updateField('subscriptions_enabled', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Payment security information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  All payment verification happens server-side via edge functions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  Webhook signatures are verified before processing events
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  Fraud detection flags suspicious transactions automatically
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  All admin actions are logged in the audit trail
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StripeSettings;

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageCircle } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [waId, setWaId] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('id, phone_number, enabled')
        .limit(1)
        .maybeSingle();
      if (error) toast.error('Failed to load WhatsApp settings');
      if (data) {
        setWaId(data.id);
        setPhone(data.phone_number ?? '');
        setEnabled(data.enabled);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const cleaned = phone.replace(/[^\d+]/g, '');
    const payload = { phone_number: cleaned || null, enabled };
    const { error } = waId
      ? await supabase.from('whatsapp_settings').update(payload).eq('id', waId)
      : await supabase.from('whatsapp_settings').insert(payload).select('id').single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('WhatsApp settings saved');
  };

  const handleRemove = async () => {
    setPhone('');
    setEnabled(false);
    setSaving(true);
    const { error } = waId
      ? await supabase.from('whatsapp_settings').update({ phone_number: null, enabled: false }).eq('id', waId)
      : await supabase.from('whatsapp_settings').insert({ phone_number: null, enabled: false });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success('WhatsApp button removed from site');
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[hsl(142,70%,45%)]" />
                WhatsApp Chat Button
              </CardTitle>
              <CardDescription>
                Control the floating WhatsApp button shown on every page. Changes apply instantly site-wide.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground text-sm">Loading…</p>
              ) : (
                <>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label className="text-base">Show WhatsApp button</Label>
                      <p className="text-sm text-muted-foreground">
                        Turn the floating chat button on or off for all visitors.
                      </p>
                    </div>
                    <Switch checked={enabled} onCheckedChange={setEnabled} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wa-phone">WhatsApp number (with country code)</Label>
                    <Input
                      id="wa-phone"
                      placeholder="e.g. +1 612 293 1250"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Digits only will be used in the wa.me link. Leave empty to hide the button.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving…' : 'Save changes'}
                    </Button>
                    <Button variant="outline" onClick={handleRemove} disabled={saving}>
                      Remove button
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your admin account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><span className="font-medium">Email:</span> {user?.email}</div>
                <div><span className="font-medium">User ID:</span> {user?.id}</div>
                <div><span className="font-medium">Role:</span> Administrator</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;

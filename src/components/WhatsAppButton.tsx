import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const WhatsAppButton = () => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>("16122931250");
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("whatsapp_settings")
        .select("phone_number, enabled")
        .limit(1)
        .maybeSingle();
      if (!active) return;
      if (data) {
        setPhoneNumber(data.phone_number);
        setEnabled(data.enabled);
      }
    };
    load();

    const channel = supabase
      .channel("whatsapp-settings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whatsapp_settings" },
        (payload) => {
          const row = (payload.new ?? payload.old) as
            | { phone_number: string | null; enabled: boolean }
            | undefined;
          if (row) {
            setPhoneNumber(row.phone_number);
            setEnabled(row.enabled);
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  if (!enabled || !phoneNumber || !phoneNumber.trim()) return null;

  const cleanNumber = phoneNumber.replace(/[^\d]/g, "");
  const message = encodeURIComponent(
    "Hello ChemSupply Pro, I'm interested in your chemical products. Could you help me with a quote?"
  );

  return (
    <a
      href={`https://wa.me/${cleanNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="hidden sm:inline text-sm font-medium">Chat with us</span>
    </a>
  );
};

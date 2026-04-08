import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cryptoKey = async (secret: string) => {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
};

const verifySignature = async (payload: string, sigHeader: string, secret: string) => {
  const parts = sigHeader.split(",").reduce((acc: Record<string, string>, part) => {
    const [k, v] = part.split("=");
    acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts["t"];
  const sig = parts["v1"];
  if (!timestamp || !sig) return false;

  // Check timestamp tolerance (5 min)
  const age = Math.abs(Date.now() / 1000 - parseInt(timestamp));
  if (age > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await cryptoKey(secret);
  const enc = new TextEncoder();
  const sigBytes = await crypto.subtle.sign("HMAC", key, enc.encode(signedPayload));
  const computed = Array.from(new Uint8Array(sigBytes)).map(b => b.toString(16).padStart(2, "0")).join("");

  return computed === sig;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.text();
    const sigHeader = req.headers.get("stripe-signature") || "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get webhook secret from payment_settings
    const { data: settings } = await supabase
      .from("payment_settings")
      .select("webhook_secret")
      .limit(1)
      .single();

    if (settings?.webhook_secret) {
      const valid = await verifySignature(body, sigHeader, settings.webhook_secret);
      if (!valid) {
        console.error("Invalid webhook signature");
        return new Response("Invalid signature", { status: 401 });
      }
    }

    const event = JSON.parse(body);
    const paymentIntent = event.data?.object;

    switch (event.type) {
      case "payment_intent.succeeded": {
        await supabase
          .from("orders")
          .update({ status: "succeeded" })
          .eq("payment_intent_id", paymentIntent.id);

        await supabase
          .from("transactions")
          .update({ status: "succeeded" })
          .eq("external_id", paymentIntent.id);

        await supabase.from("audit_logs").insert({
          action: "payment_succeeded",
          data: { payment_intent_id: paymentIntent.id, amount: paymentIntent.amount / 100 },
        });
        break;
      }

      case "payment_intent.payment_failed": {
        await supabase
          .from("orders")
          .update({ status: "failed" })
          .eq("payment_intent_id", paymentIntent.id);

        await supabase
          .from("transactions")
          .update({ status: "failed" })
          .eq("external_id", paymentIntent.id);

        await supabase.from("audit_logs").insert({
          action: "payment_failed",
          data: { payment_intent_id: paymentIntent.id, error: paymentIntent.last_payment_error?.message },
        });
        break;
      }

      case "charge.refunded": {
        const piId = paymentIntent.payment_intent;
        await supabase
          .from("orders")
          .update({ status: "refunded" })
          .eq("payment_intent_id", piId);

        await supabase
          .from("transactions")
          .update({ status: "refunded" })
          .eq("external_id", piId);

        await supabase.from("audit_logs").insert({
          action: "payment_refunded",
          data: { payment_intent_id: piId, amount_refunded: paymentIntent.amount_refunded / 100 },
        });
        break;
      }

      case "invoice.payment_failed": {
        const subId = paymentIntent.subscription;
        if (subId) {
          await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", subId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        await supabase
          .from("subscriptions")
          .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
          .eq("stripe_subscription_id", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

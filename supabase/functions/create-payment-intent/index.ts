import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, currency = "usd", customer_email, items, metadata = {} } = await req.json();

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // The secret key lives ONLY in the Supabase secret store, never in the DB.
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return new Response(JSON.stringify({ error: "Stripe is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // The DB row still holds the non-secret toggles (enabled / test-live mode).
    const { data: settings } = await supabase
      .from("payment_settings")
      .select("stripe_enabled, stripe_mode")
      .limit(1)
      .single();

    if (!settings?.stripe_enabled) {
      return new Response(JSON.stringify({ error: "Stripe is not enabled" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Guard against a test key being used while the store is in live mode.
    const keyIsLive = stripeKey.startsWith("sk_live_");
    if (settings.stripe_mode === "live" && !keyIsLive) {
      console.error("Live mode enabled but STRIPE_SECRET_KEY is a test key");
      return new Response(JSON.stringify({ error: "Stripe key does not match live mode" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (settings.stripe_mode !== "live" && keyIsLive) {
      console.error("Test mode enabled but STRIPE_SECRET_KEY is a live key");
      return new Response(JSON.stringify({ error: "Stripe key does not match test mode" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count: recentOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", clientIp)
      .gte("created_at", oneHourAgo);

    const fraudFlag = (recentOrders ?? 0) > 10 ? "suspicious" : "safe";

    const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: String(Math.round(amount * 100)),
        currency,
        ...(customer_email ? { receipt_email: customer_email } : {}),
        "metadata[source]": "chemsupply_pro",
        "metadata[fraud_flag]": fraudFlag,
      }),
    });

    const paymentIntent = await stripeRes.json();

    if (paymentIntent.error) {
      return new Response(JSON.stringify({ error: paymentIntent.error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order } = await supabase.from("orders").insert({
      total_amount: amount,
      currency,
      customer_email,
      payment_provider: "stripe",
      payment_intent_id: paymentIntent.id,
      status: "pending",
      fraud_flag: fraudFlag,
      ip_address: clientIp,
      metadata: { items, ...metadata },
    }).select().single();

    if (order) {
      await supabase.from("transactions").insert({
        order_id: order.id,
        amount,
        currency,
        provider: "stripe",
        status: "pending",
        external_id: paymentIntent.id,
        fraud_flag: fraudFlag,
      });
    }

    await supabase.from("audit_logs").insert({
      action: "payment_intent_created",
      data: { payment_intent_id: paymentIntent.id, amount, fraud_flag: fraudFlag },
      ip_address: clientIp,
    });

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        order_id: order?.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

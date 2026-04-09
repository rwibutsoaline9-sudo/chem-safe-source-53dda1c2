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

    const { data: settings } = await supabase
      .from("payment_settings")
      .select("stripe_secret_key, stripe_enabled, stripe_mode")
      .limit(1)
      .single();

    if (!settings?.stripe_enabled || !settings?.stripe_secret_key) {
      return new Response(JSON.stringify({ error: "Stripe is not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeKey = settings.stripe_secret_key;

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

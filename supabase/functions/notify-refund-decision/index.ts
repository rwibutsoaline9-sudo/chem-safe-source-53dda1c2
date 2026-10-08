import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const isId = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);

const MESSAGES: Record<string, string> = {
  reviewing: "Our team is now reviewing your request.",
  approved: "Good news — your request has been approved. We'll process your resolution shortly.",
  rejected: "After review, we are unable to approve your request.",
  refunded: "Your refund has been issued. It may take 5–10 business days to appear on your statement.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: claims } = await userClient.auth.getClaims(auth.slice(7));
    const uid = claims?.claims?.sub;
    if (!uid) return json({ error: "Unauthorized" }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: role } = await admin.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
    if (!role) return json({ error: "Admin access required" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = body.action === "send" ? "send" : "draft";

    if (action === "draft") {
      if (!isId(body.request_id)) return json({ error: "request_id required" }, 400);
      const { data: r } = await admin.from("refund_requests").select("*").eq("id", body.request_id).maybeSingle();
      if (!r) return json({ error: "Not found" }, 404);
      const msg = MESSAGES[r.status];
      if (!msg) return json({ drafted: false });
      const from = Deno.env.get("RETURNS_FROM_EMAIL") ?? "Returns <onboarding@resend.dev>";
      const note = r.admin_notes ? `<p><strong>Note from our team:</strong> ${esc(r.admin_notes)}</p>` : "";
      const html = `<p>Hello ${esc(r.customer_name)},</p><p>${msg}</p>
<p>Order: <strong>${esc(r.order_reference)}</strong><br/>Product: ${esc(r.product_name)}</p>${note}
<p>Reply to this email if you have any questions.</p>`;
      const { data: d, error } = await admin.from("returns_emails").insert({
        request_id: r.id, to_email: r.email, from_email: from,
        subject: `Your return request ${r.order_reference}: ${r.status}`, html,
      }).select("id").single();
      if (error) return json({ error: error.message }, 500);
      return json({ drafted: true, id: d.id });
    }

    // send a reviewed draft
    if (!isId(body.email_id)) return json({ error: "email_id required" }, 400);
    const { data: e } = await admin.from("returns_emails").select("*").eq("id", body.email_id).maybeSingle();
    if (!e) return json({ error: "Not found" }, 404);
    if (e.status === "sent") return json({ error: "Already sent" }, 409);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) return json({ sent: false, reason: "email not configured" });

    const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}`, "X-Connection-Api-Key": RESEND_API_KEY },
      body: JSON.stringify({ from: e.from_email, to: [e.to_email], subject: e.subject, html: e.html }),
    });
    if (!res.ok) {
      const details = await res.text();
      console.error(`Resend failed [${res.status}]: ${details}`);
      await admin.from("returns_emails").update({ status: "failed", error: details.slice(0, 1000) }).eq("id", e.id);
      return json({ sent: false, reason: "send failed", details });
    }
    await admin.from("returns_emails").update({ status: "sent", error: null, sent_at: new Date().toISOString() }).eq("id", e.id);
    await admin.from("audit_logs").insert({ action: "refund_email_sent", actor_id: uid, data: { email_id: e.id } });
    return json({ sent: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

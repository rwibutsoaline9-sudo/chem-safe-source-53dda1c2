import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

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
    const id = typeof body.request_id === "string" ? body.request_id : "";
    if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "request_id required" }, 400);

    const { data: r } = await admin.from("refund_requests").select("*").eq("id", id).maybeSingle();
    if (!r) return json({ error: "Not found" }, 404);
    const msg = MESSAGES[r.status];
    if (!msg) return json({ emailed: false, reason: "status has no email" });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) return json({ emailed: false, reason: "email not configured" });

    const from = Deno.env.get("RETURNS_FROM_EMAIL") ?? "Returns <onboarding@resend.dev>";
    const note = r.admin_notes ? `<p><strong>Note from our team:</strong> ${esc(r.admin_notes)}</p>` : "";
    const html = `<p>Hello ${esc(r.customer_name)},</p><p>${msg}</p>
      <p>Order: <strong>${esc(r.order_reference)}</strong><br/>Product: ${esc(r.product_name)}</p>${note}
      <p>Reply to this email if you have any questions.</p>`;

    await admin.from("audit_logs").insert({ action: "refund_email", actor_id: uid, data: { request_id: id, status: r.status } });
    const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}`, "X-Connection-Api-Key": RESEND_API_KEY },
      body: JSON.stringify({ from, to: [r.email], subject: `Your return request ${r.order_reference}: ${r.status}`, html }),
    });
    if (!res.ok) {
      const details = await res.text();
      console.error(`Resend failed [${res.status}]: ${details}`);
      return json({ emailed: false, reason: "send failed", details }, 200);
    }
    return json({ emailed: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

// Public edge function: secure visitor chat API.
// Backs the SiteChat widget. Uses service-role to access chat tables (RLS is admin-only).
// Every call must supply the visitor_id; we verify it matches conversation.visitor_id.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM_PROMPT = `You are the AI customer assistant for an industrial chemical supply company (B2B).

ROLE
- Greet warmly and help visitors with: product inquiries, pricing/quote process, packaging, shipping/lead times, SDS documents, safety, KYC requirements, payment options.
- You are NOT a human agent. If asked, say you are an AI assistant and a human team member will reply as soon as they are available.
- Always reply in the SAME language the visitor wrote in.

STYLE
- Concise (2-5 sentences). Friendly, professional, confident.
- Use short bullet lists only when truly useful.
- Never invent product specs, prices, CAS numbers, or stock. If unsure say: "Let me have a teammate confirm the exact details."

ACTIONS
- For quotes, ask for: product name, grade/purity, quantity, destination country, and a business email.
- For SDS, tell them to open the product page and click "Download SDS", or that the team can email it after KYC.
- For restricted/regulated products, mention KYC + business license is required before shipment.
- When relevant, suggest they request a formal quote via the Contact page.

If the visitor asks for a human, reassure them: "I've flagged this for our team — an agent will join the chat shortly."`;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isUuid(s: unknown): s is string {
  return typeof s === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

async function verifyOwnership(conversationId: string, visitorId: string) {
  const { data } = await supabase
    .from("chat_conversations")
    .select("id, visitor_id, ai_enabled, status, unread_admin")
    .eq("id", conversationId)
    .maybeSingle();
  if (!data || data.visitor_id !== visitorId) return null;
  return data;
}

async function generateAiReply(conversationId: string) {
  // Build short history
  const { data: history } = await supabase
    .from("chat_messages")
    .select("sender_type, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(12);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(history ?? []).map((m) => ({
      role: m.sender_type === "visitor" ? "user" : "assistant",
      content: m.content,
    })),
  ];

  const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
  });

  if (!aiRes.ok) {
    console.error("AI gateway error", aiRes.status, await aiRes.text());
    return null;
  }
  const j = await aiRes.json();
  const reply: string =
    j?.choices?.[0]?.message?.content?.trim() ||
    "I'm here — could you share a bit more so I can help?";

  await supabase.from("chat_messages").insert({
    conversation_id: conversationId,
    sender_type: "ai",
    content: reply,
  });
  await supabase
    .from("chat_conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);
  return reply;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const action = String(body.action ?? "");
  const visitorId = body.visitor_id;
  if (!isUuid(visitorId)) return json({ error: "visitor_id required" }, 400);

  try {
    switch (action) {
      case "start": {
        const name = typeof body.visitor_name === "string"
          ? body.visitor_name.slice(0, 100)
          : null;

        // Reuse most recent open conversation for this visitor if any
        const { data: existing } = await supabase
          .from("chat_conversations")
          .select("id")
          .eq("visitor_id", visitorId)
          .eq("status", "open")
          .order("last_message_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing) return json({ conversation_id: existing.id });

        const { data, error } = await supabase
          .from("chat_conversations")
          .insert({ visitor_id: visitorId, visitor_name: name })
          .select("id")
          .single();
        if (error || !data) return json({ error: "Could not start chat" }, 500);
        return json({ conversation_id: data.id });
      }

      case "list_messages": {
        const conversationId = body.conversation_id;
        if (!isUuid(conversationId)) return json({ error: "conversation_id required" }, 400);
        const owner = await verifyOwnership(conversationId, visitorId);
        if (!owner) return json({ error: "Not found" }, 404);

        const since = typeof body.since === "string" ? body.since : null;
        let q = supabase
          .from("chat_messages")
          .select("id, sender_type, content, created_at")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })
          .limit(200);
        if (since) q = q.gt("created_at", since);
        const { data, error } = await q;
        if (error) return json({ error: error.message }, 500);
        return json({ messages: data ?? [] });
      }

      case "send_message": {
        const conversationId = body.conversation_id;
        const content = typeof body.content === "string" ? body.content.trim() : "";
        if (!isUuid(conversationId)) return json({ error: "conversation_id required" }, 400);
        if (!content || content.length > 4000) return json({ error: "Invalid content" }, 400);
        const owner = await verifyOwnership(conversationId, visitorId);
        if (!owner) return json({ error: "Not found" }, 404);

        const { data: inserted, error } = await supabase
          .from("chat_messages")
          .insert({
            conversation_id: conversationId,
            sender_type: "visitor",
            content,
          })
          .select("id, sender_type, content, created_at")
          .single();
        if (error || !inserted) return json({ error: "Insert failed" }, 500);

        // Update conversation activity + admin unread badge
        await supabase
          .from("chat_conversations")
          .update({
            last_message_at: new Date().toISOString(),
            unread_admin: (owner.unread_admin ?? 0) + 1,
          })
          .eq("id", conversationId);

        // AI auto-reply when no admin has taken over
        let aiReply: string | null = null;
        if (owner.ai_enabled && owner.status === "open") {
          aiReply = await generateAiReply(conversationId);
        }

        return json({ message: inserted, ai_reply: aiReply });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    console.error("site-chat error", e);
    return json({ error: String(e) }, 500);
  }
});

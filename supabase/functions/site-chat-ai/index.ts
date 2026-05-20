// Public edge function: generates an AI reply for the visitor chat widget.
// Called by the visitor's browser whenever they send a message AND
// ai_enabled = true on the conversation (i.e. no admin has taken over yet).
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

interface Body {
  conversation_id: string;
  visitor_message: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { conversation_id, visitor_message } = (await req.json()) as Body;
    if (!conversation_id || !visitor_message?.trim()) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Make sure AI is still enabled for this conversation (admin may have taken over)
    const { data: convo } = await supabase
      .from("chat_conversations")
      .select("id, ai_enabled, status")
      .eq("id", conversation_id)
      .maybeSingle();

    if (!convo || !convo.ai_enabled || convo.status !== "open") {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build short history (last 12 messages)
    const { data: history } = await supabase
      .from("chat_messages")
      .select("sender_type, content, created_at")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(12);

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history ?? []).map((m) => ({
        role: m.sender_type === "visitor" ? "user" : "assistant",
        content: m.content,
      })),
    ];

    // Lovable AI Gateway (OpenAI-compatible)
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("AI gateway error", aiRes.status, txt);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway ${aiRes.status}`);
    }

    const json = await aiRes.json();
    const reply: string =
      json?.choices?.[0]?.message?.content?.trim() ||
      "I'm here — could you share a bit more so I can help?";

    // Insert AI reply
    await supabase.from("chat_messages").insert({
      conversation_id,
      sender_type: "ai",
      content: reply,
    });

    // Bump conversation
    await supabase
      .from("chat_conversations")
      .update({
        last_message_at: new Date().toISOString(),
        unread_admin: (await supabase
          .from("chat_conversations")
          .select("unread_admin")
          .eq("id", conversation_id)
          .maybeSingle()).data?.unread_admin ?? 0,
      })
      .eq("id", conversation_id);

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("site-chat-ai error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

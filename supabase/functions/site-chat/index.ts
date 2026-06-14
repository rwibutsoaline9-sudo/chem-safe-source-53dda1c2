// Public edge function: secure visitor chat API.
// Backs the SiteChat widget. Uses service-role to access chat tables (RLS is admin-only).
// The AI assistant can call tools (search_products, get_product_details) to ground answers
// in the real catalog instead of guessing.
import { createClient } from "npm:@supabase/supabase-js@2";
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible";
import { generateText, tool, stepCountIs } from "npm:ai";
import { z } from "npm:zod";

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
- You are NOT a human agent. If asked, say you are an AI assistant and a human teammate will reply as soon as they are available.
- Always reply in the SAME language the visitor wrote in.

TOOLS — USE THEM, DO NOT GUESS
- When a visitor mentions ANY product, chemical name, CAS number, grade, application, or category, FIRST call \`search_products\` to look it up in our live catalog.
- If they ask for full specs, packaging, price, or a direct link, call \`get_product_details\` with the slug returned by search.
- Never invent product names, CAS numbers, prices, purities, or stock. If a search returns no results, say so plainly and offer to take a custom quote request.

STYLE
- Concise (2-5 sentences). Friendly, professional, confident. Markdown is fine (bold, short bullets, links).
- When you reference a product, link to it as \`/products/<slug>\`.
- For quotes ask: product name, grade/purity, quantity, destination country, business email.
- For SDS: tell them to open the product page and click "Download SDS", or that the team can email it after KYC.
- For restricted/regulated products: mention KYC + business license is required before shipment.

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

// --- AI tools ---------------------------------------------------------------

const searchProductsTool = tool({
  description:
    "Search the live product catalog by free text (product name, chemical, CAS number, category, application, grade). Returns up to 6 matches with slug, name, category, purity, grade, price and restricted flag.",
  inputSchema: z.object({
    query: z.string().min(1).describe("What the visitor is looking for"),
  }),
  execute: async ({ query }) => {
    const q = query.trim();
    const like = `%${q.replace(/[%_]/g, "")}%`;
    const { data, error } = await supabase
      .from("products")
      .select(
        "slug, name, category, purity, grade, cas_number, price_value, price_unit, price_currency, is_restricted, applications",
      )
      .or(
        `name.ilike.${like},category.ilike.${like},cas_number.ilike.${like},description.ilike.${like}`,
      )
      .limit(6);
    if (error) return { error: error.message, results: [] };
    return {
      count: data?.length ?? 0,
      results: (data ?? []).map((p) => ({
        slug: p.slug,
        name: p.name,
        category: p.category,
        purity: p.purity,
        grade: p.grade,
        cas_number: p.cas_number,
        price: p.price_value
          ? `${p.price_currency ?? "USD"} ${p.price_value}/${p.price_unit ?? "unit"}`
          : null,
        restricted: p.is_restricted,
        applications: (p.applications ?? []).slice(0, 4),
        url: `/products/${p.slug}`,
      })),
    };
  },
});

const getProductDetailsTool = tool({
  description:
    "Fetch full details for a single product by its slug (use a slug returned from search_products).",
  inputSchema: z.object({
    slug: z.string().min(1),
  }),
  execute: async ({ slug }) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) return { error: error.message };
    if (!data) return { error: "not_found" };
    return {
      slug: data.slug,
      name: data.name,
      category: data.category,
      purity: data.purity,
      grade: data.grade,
      cas_number: data.cas_number,
      description: data.description,
      applications: data.applications,
      packaging: data.packaging,
      price: data.price_value
        ? `${data.price_currency ?? "USD"} ${data.price_value}/${data.price_unit ?? "unit"}`
        : null,
      restricted: data.is_restricted,
      url: `/products/${data.slug}`,
    };
  },
});

// --- AI reply ---------------------------------------------------------------

async function generateAiReply(conversationId: string): Promise<string | null> {
  const { data: history } = await supabase
    .from("chat_messages")
    .select("sender_type, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(20);

  const messages = [
    ...(history ?? []).map((m) => ({
      role: (m.sender_type === "visitor" ? "user" : "assistant") as
        | "user"
        | "assistant",
      content: m.content,
    })),
  ];

  try {
    const provider = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: {
        "Lovable-API-Key": LOVABLE_API_KEY,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
    });

    const { text } = await generateText({
      model: provider("google/gemini-3-flash-preview"),
      system: SYSTEM_PROMPT,
      messages,
      tools: {
        search_products: searchProductsTool,
        get_product_details: getProductDetailsTool,
      },
      stopWhen: stepCountIs(50),
    });

    const reply = text?.trim() ||
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
  } catch (e) {
    console.error("AI generation failed", e);
    return null;
  }
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

        await supabase
          .from("chat_conversations")
          .update({
            last_message_at: new Date().toISOString(),
            unread_admin: (owner.unread_admin ?? 0) + 1,
          })
          .eq("id", conversationId);

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

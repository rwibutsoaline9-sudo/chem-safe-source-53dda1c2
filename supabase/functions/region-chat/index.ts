// Streaming AI chat for regional landing pages. Public (no JWT).
import { convertToModelMessages, streamText, type UIMessage } from "npm:ai@6";
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const gateway = createOpenAICompatible({
  name: "lovable",
  baseURL: "https://ai.gateway.lovable.dev/v1",
  headers: {
    "Lovable-API-Key": LOVABLE_API_KEY ?? "",
    "X-Lovable-AIG-SDK": "vercel-ai-sdk",
  },
});

type RegionMeta = {
  name: string;
  localizedName: string;
  language: string; // human-friendly language name
  langCode: string;
  currency: string;
  hub: string;
  compliance: string; // short compliance summary
};

const buildSystemPrompt = (r: RegionMeta) => `You are the ChemSupply Pro AI Assistant for the ${r.name} (${r.localizedName}) region.

CRITICAL LANGUAGE RULE: Always reply in ${r.language} (BCP-47: ${r.langCode}), regardless of the language the user writes in. Keep technical terms (CAS, SDS, REACH, GHS, COA, Incoterms, etc.) in their standard form.

Your job:
1. Answer questions about industrial chemical products, specifications, packaging, COA, SDS/MSDS.
2. Explain regional compliance: ${r.compliance}.
3. Explain shipping, Incoterms, lead times via the regional logistics hubs: ${r.hub}. Currency in this region: ${r.currency}.
4. Be concise, accurate, and professional. Use short paragraphs and bullet lists where helpful (markdown).
5. For pricing, sample requests, custom orders, regulated chemicals, or anything requiring a human, ALWAYS direct the user to the quote form at /contact. Use a clickable markdown link in the user's language, e.g. "[Angebot anfordern](/contact)" / "[اطلب عرض سعر](/contact)" / "[申请报价](/contact)" / "[Demander un devis](/contact)" / "[Solicitar cotización](/contact)".
6. Never invent CAS numbers, registration numbers, or prices. If unsure, say so and recommend the quote form.
7. Safety first: remind that all hazardous chemicals require proper PPE, licensing, and SDS review before use.

ChemSupply Pro is a verified US B2B supplier based at 30 E 7th St, St Paul, MN 55101 (+1 612-293-1250, support@drchems.com), ISO 9001:2015, GMP, FDA-registered.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "AI is not configured." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { messages, region } = (await req.json()) as {
      messages: UIMessage[];
      region: RegionMeta;
    };

    if (!Array.isArray(messages) || !region) {
      return new Response(JSON.stringify({ error: "messages and region are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = streamText({
      model: gateway("google/gemini-3-flash-preview"),
      system: buildSystemPrompt(region),
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({ headers: corsHeaders });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("region-chat error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

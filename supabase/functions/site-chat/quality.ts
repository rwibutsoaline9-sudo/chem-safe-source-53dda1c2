// Pure helpers shared by the site-chat function and its automated tests.
// Keeping them dependency-free makes the conversation-quality rules verifiable
// without hitting the database or the AI gateway.

export const INTERNAL_NOTE_PREFIX = "_Internal note:";

/** Strips markdown links/code so punctuation inside them isn't counted. */
function stripMarkup(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
}

/** Counts real questions addressed to the visitor. */
export function countQuestions(text: string): number {
  const clean = stripMarkup(text);
  return (clean.match(/\?+/g) ?? []).length;
}

/** Rule: at most ONE question per assistant message. */
export function followsOneQuestionRule(text: string): boolean {
  return countQuestions(text) <= 1;
}

const INTRO_PATTERNS = [
  /\bi'?m alex\b/i,
  /\bthis is alex\b/i,
  /\balex here\b/i,
  /\bmy name is alex\b/i,
];

export function isSelfIntroduction(text: string): boolean {
  const clean = stripMarkup(text);
  return INTRO_PATTERNS.some((re) => re.test(clean));
}

/**
 * Rule: never re-introduce yourself. Only the first assistant turn may
 * contain a self-introduction.
 */
export function followsNoRepeatIntroRule(
  assistantMessages: string[],
): boolean {
  return assistantMessages
    .slice(1)
    .every((m) => !isSelfIntroduction(m));
}

/** Rule: never send the exact same sentence twice across the conversation. */
export function followsNoRepeatedSentenceRule(
  assistantMessages: string[],
): boolean {
  const seen = new Set<string>();
  for (const msg of assistantMessages) {
    for (const raw of stripMarkup(msg).split(/(?<=[.!?])\s+/)) {
      const s = raw.trim().toLowerCase().replace(/\s+/g, " ");
      if (s.length < 15) continue;
      if (seen.has(s)) return false;
      seen.add(s);
    }
  }
  return true;
}

export function isInternalNote(content: string): boolean {
  return content.startsWith(INTERNAL_NOTE_PREFIX);
}

/** History sent to the model must never contain internal notes. */
export function sanitizeHistory<T extends { content: string }>(
  history: T[],
): T[] {
  return history.filter((m) => !isInternalNote(m.content));
}

export type FallbackKind = "rate_limited" | "credits" | "blocked" | "generic";

export function classifyFailure(error: unknown): FallbackKind {
  const raw = String(
    (error as { message?: string })?.message ?? error ?? "",
  );
  if (raw.includes("429")) return "rate_limited";
  if (raw.includes("402")) return "credits";
  if (raw.includes("403") || raw.includes("401")) return "blocked";
  return "generic";
}

/**
 * Honest, human fallback copy — never a fake assistant answer and never silence.
 * Always points to a real human channel.
 */
export function fallbackMessage(kind: FallbackKind): string {
  switch (kind) {
    case "rate_limited":
      return "Sorry — I'm getting a lot of questions at once right now, so I couldn't get to yours. Give me a moment and resend, or reach our team at [/contact](/contact) and we'll reply fast.";
    case "credits":
      return "I can't reach my assistant service at the moment, so I don't want to guess at an answer. Our team can help right away — drop your details at [/contact](/contact) or call +1 (612) 293-1250.";
    case "blocked":
      return "My assistant service is unavailable on my side right now, so I can't answer that properly. A human teammate can take it directly at [/contact](/contact) or +1 (612) 293-1250.";
    default:
      return "Something glitched on my side while pulling that up — sorry about that, I'd rather say so than guess. Ask me again, or our team can take it directly at [/contact](/contact).";
  }
}

const DISHONEST_PATTERNS = [
  /\bi (?:have|already) (?:sent|emailed) (?:you )?the/i,
  /\bhere (?:is|are) the (?:price|spec|sds)\b/i,
  /\bthe price is\b/i,
];

/** A fallback must admit the failure and route to a human, never fabricate. */
export function isHonestFallback(text: string): boolean {
  const routesToHuman = /\/contact|\+1 \(612\) 293-1250/.test(text);
  const admitsFailure =
    /(sorry|couldn't|can't|glitched|unavailable|didn't|rather say so)/i.test(text);
  const fabricates = DISHONEST_PATTERNS.some((re) => re.test(text));
  return routesToHuman && admitsFailure && !fabricates;
}

// --- Human handoff briefing ------------------------------------------------

export interface HandoffBrief {
  reason: string;
  visitor_intent?: string | null;
  unanswered_question?: string | null;
  compliance_constraints?: string | null;
  products_discussed?: string[] | null;
  quote_details?: string | null;
  urgency?: "low" | "normal" | "high" | null;
}

function clamp(value: string, max: number): string {
  const s = value.trim().replace(/\s+/g, " ");
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

/**
 * Builds the internal note a human teammate reads when picking up the chat.
 * Always carries intent, the exact unanswered question and any SDS/compliance
 * constraint already discussed, so the human never restarts the conversation.
 */
export function buildHandoffNote(brief: HandoffBrief): string {
  const lines = [
    `${INTERNAL_NOTE_PREFIX} HUMAN HANDOFF REQUESTED`,
    `• Reason: ${clamp(brief.reason || "not specified", 300)}`,
    `• Visitor intent: ${brief.visitor_intent ? clamp(brief.visitor_intent, 300) : "unclear from conversation"}`,
    `• Exact unanswered question: ${brief.unanswered_question ? `"${clamp(brief.unanswered_question, 300)}"` : "none pending"}`,
    `• SDS / compliance constraints discussed: ${brief.compliance_constraints ? clamp(brief.compliance_constraints, 400) : "none mentioned"}`,
  ];
  const products = (brief.products_discussed ?? []).filter(Boolean).slice(0, 6);
  if (products.length) {
    lines.push(`• Products discussed: ${products.map((p) => clamp(p, 80)).join(", ")}`);
  }
  if (brief.quote_details) {
    lines.push(`• Quote details collected so far: ${clamp(brief.quote_details, 400)}`);
  }
  lines.push(`• Urgency: ${brief.urgency ?? "normal"}`);
  return `${lines.join("\n")}_`;
}

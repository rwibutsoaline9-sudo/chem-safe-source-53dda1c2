// Automated conversation-quality tests for the "Alex" site-chat assistant.
// These verify the deterministic rules the assistant must obey: one question per
// message, no repeated self-introductions or sentences, internal notes never
// leaking into model history, honest failure fallbacks, and complete human
// handoff briefings.
import {
  assert,
  assertEquals,
  assertFalse,
  assertStringIncludes,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  buildHandoffNote,
  classifyFailure,
  countQuestions,
  fallbackMessage,
  followsNoRepeatedSentenceRule,
  followsNoRepeatIntroRule,
  followsOneQuestionRule,
  isHonestFallback,
  isInternalNote,
  isSelfIntroduction,
  sanitizeHistory,
} from "./quality.ts";

// --- one question at a time -------------------------------------------------

Deno.test("one question rule: a single closing question passes", () => {
  const reply =
    "Caustic soda flakes at 99% are the right fit for water treatment dosing. Want me to build a quick quote?";
  assertEquals(countQuestions(reply), 1);
  assert(followsOneQuestionRule(reply));
});

Deno.test("one question rule: zero questions passes", () => {
  assert(followsOneQuestionRule("Here's the SDS summary — PPE, storage and hazard class are all covered."));
});

Deno.test("one question rule: interrogating the visitor fails", () => {
  const reply =
    "What's your application? How much per month? Which port should we quote to?";
  assertEquals(countQuestions(reply), 3);
  assertFalse(followsOneQuestionRule(reply));
});

Deno.test("one question rule: question marks inside links/code are ignored", () => {
  const reply = "Full specs live at [the product page](/products/caustic-soda?ref=chat). Shall I send the SDS?";
  assertEquals(countQuestions(reply), 1);
  assert(followsOneQuestionRule(reply));
});

// --- no repeated intros -----------------------------------------------------

Deno.test("intro detection recognises self-introductions", () => {
  assert(isSelfIntroduction("Hi Maria 👋 I'm Alex from ChemSupply Pro."));
  assert(isSelfIntroduction("Alex here — happy to help."));
  assertFalse(isSelfIntroduction("Happy to help with that grade comparison."));
});

Deno.test("no repeat intro rule: only the first turn may introduce Alex", () => {
  assert(
    followsNoRepeatIntroRule([
      "Hi 👋 I'm Alex, technical sales at ChemSupply Pro. What are you dosing this into?",
      "Got it — for cooling water, 99% flakes are the usual pick.",
      "Shall I send the SDS so your team can review it?",
    ]),
  );
});

Deno.test("no repeat intro rule: re-introducing later fails", () => {
  assertFalse(
    followsNoRepeatIntroRule([
      "Hi 👋 I'm Alex from ChemSupply Pro.",
      "Hi again, I'm Alex — how can I help?",
    ]),
  );
});

Deno.test("no repeated sentence rule catches recycled closes", () => {
  assert(
    followsNoRepeatedSentenceRule([
      "Want me to build a quick quote for that volume?",
      "I can hold today's tiered price for you if that helps.",
    ]),
  );
  assertFalse(
    followsNoRepeatedSentenceRule([
      "Want me to build a quick quote for that volume?",
      "Sure thing. Want me to build a quick quote for that volume?",
    ]),
  );
});

// --- internal notes stay internal ------------------------------------------

Deno.test("internal handoff notes are stripped from model history", () => {
  const history = [
    { sender_type: "visitor", content: "I need to talk to a person." },
    { sender_type: "ai", content: buildHandoffNote({ reason: "asked for a human" }) },
    { sender_type: "ai", content: "A teammate is jumping in now." },
  ];
  const sanitized = sanitizeHistory(history);
  assertEquals(sanitized.length, 2);
  assertFalse(sanitized.some((m) => isInternalNote(m.content)));
});

// --- honest fallbacks -------------------------------------------------------

Deno.test("failure classification maps gateway statuses", () => {
  assertEquals(classifyFailure(new Error("gateway returned 429 Too Many Requests")), "rate_limited");
  assertEquals(classifyFailure(new Error("402 payment required")), "credits");
  assertEquals(classifyFailure(new Error("403 forbidden")), "blocked");
  assertEquals(classifyFailure(new Error("socket hang up")), "generic");
});

Deno.test("every fallback is honest and routes to a human", () => {
  for (const kind of ["rate_limited", "credits", "blocked", "generic"] as const) {
    const msg = fallbackMessage(kind);
    assert(isHonestFallback(msg), `${kind} fallback must be honest: ${msg}`);
    assert(followsOneQuestionRule(msg), `${kind} fallback must not interrogate`);
  }
});

Deno.test("fabricated answers are rejected as fallbacks", () => {
  assertFalse(isHonestFallback("Sure — the price is USD 420/MT and I already emailed you the SDS."));
  assertFalse(isHonestFallback("Something went wrong."));
});

// --- human handoff briefing -------------------------------------------------

Deno.test("handoff note carries intent, unanswered question and SDS constraints", () => {
  const note = buildHandoffNote({
    reason: "needs pricing approval below tier floor",
    visitor_intent: "buy 20 MT sodium cyanide for gold leaching in Ghana, price-sensitive",
    unanswered_question: "Can you match USD 1,850/MT CIF Tema?",
    compliance_constraints:
      "restricted item — KYC + mining licence pending; requested SDS + COA in English, IMDG class 6.1",
    products_discussed: ["sodium-cyanide-98", "Caustic Soda Flakes 99%"],
    quote_details: "20 MT, 1 MT jumbo bags, CIF Tema, procurement@example.com",
    urgency: "high",
  });
  assert(isInternalNote(note));
  assertStringIncludes(note, "HUMAN HANDOFF REQUESTED");
  assertStringIncludes(note, "Visitor intent: buy 20 MT sodium cyanide");
  assertStringIncludes(note, 'Exact unanswered question: "Can you match USD 1,850/MT CIF Tema?"');
  assertStringIncludes(note, "KYC + mining licence pending");
  assertStringIncludes(note, "IMDG class 6.1");
  assertStringIncludes(note, "sodium-cyanide-98, Caustic Soda Flakes 99%");
  assertStringIncludes(note, "CIF Tema");
  assertStringIncludes(note, "Urgency: high");
});

Deno.test("handoff note degrades gracefully with missing fields", () => {
  const note = buildHandoffNote({ reason: "visitor asked for a human" });
  assertStringIncludes(note, "Visitor intent: unclear from conversation");
  assertStringIncludes(note, "Exact unanswered question: none pending");
  assertStringIncludes(note, "SDS / compliance constraints discussed: none mentioned");
  assertStringIncludes(note, "Urgency: normal");
});

Deno.test("handoff note clamps oversized fields", () => {
  const note = buildHandoffNote({
    reason: "x".repeat(900),
    compliance_constraints: "y".repeat(900),
  });
  for (const line of note.split("\n")) {
    assert(line.length < 500, `line too long: ${line.length}`);
  }
});

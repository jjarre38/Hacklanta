import test, { mock } from "node:test";
import assert from "node:assert/strict";
import spanish from "@/lib/i18n/es.json";
import { translate, localizeAuthoredText, validLocale } from "@/lib/i18n/core";
import { presentCaseEvent } from "@/lib/i18n/events";
import { landlordTemplate } from "@/lib/i18n/landlordTemplate";
import { selectLocalVoice } from "@/lib/i18n/speech";
import { resetMaria, runMariaTransition } from "@/lib/demo/mariaSeed";
import { generateActionPlan } from "@/lib/services/recommendationService";
import { applyCaseUpdate, toggleActionCompleted } from "@/lib/services/caseService";
import { calculateFinancialGap } from "@/lib/engine/resourceCombinationEngine";
import { matchResources } from "@/lib/engine/resourceMatcher";
import { classifyCase } from "@/lib/engine/caseClassifier";
import { housingGuidance } from "@/lib/engine/housingGuidance";
import { RESOURCES } from "@/lib/data/resources";
import { RIGHTS_CONTENT } from "@/lib/data/rightsContent";
import { formatDate, formatMoney } from "@/lib/format";
import { intakeSchema } from "@/lib/intake/schema";
import { draftRequestSchema, draftLandlordMessage } from "@/lib/ai/messageDrafter";
import { getAnthropic } from "@/lib/anthropic";
import { POST as speech } from "@/app/api/speech/route";

const now = new Date("2026-10-11T16:00:00Z");

test("dictionary has matching interpolation slots and safe English fallback", () => {
  for (const [key, value] of Object.entries(spanish)) {
    const slots = (s: string) => Array.from(new Set(s.match(/\{\w+\}/g) ?? [])).sort();
    assert.deepEqual(slots(value), slots(key), key);
    assert.ok(value.trim());
  }
  assert.equal(validLocale("fr"), "en");
  assert.equal(translate("es", "Missing {name}", { name: "$& <script>" }), "Missing $& <script>");
  assert.equal(translate("es", "My plan"), "Mi plan");
  assert.equal(translate("en", "My plan"), "My plan");
});

test("Spanish recommendation presentation preserves every action ID, urgency, destination and completion", () => {
  const network = mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected network request"); });
  try {
    for (const c of [resetMaria(now), runMariaTransition(resetMaria(now), now), { ...resetMaria(now), newHousingFound: true, caseStatus: "TRANSITION_RECOVERY" as const }]) {
      const userCase = toggleActionCompleted(c, "contact-legal-aid");
      const saved = JSON.stringify(userCase);
      const gap = calculateFinancialGap(userCase, RESOURCES, now);
      const matches = matchResources(RESOURCES, userCase);
      const status = classifyCase(userCase, now);
      const en = generateActionPlan(userCase, now, "en");
      const es = generateActionPlan(userCase, now, "es");
      const stable = (items: typeof en) => items.map(({ id, urgency, href, completed }) => ({ id, urgency, href, completed }));
      assert.deepEqual(stable(es), stable(en));
      for (let i = 0; i < es.length; i++) for (const key of ["title", "description", "reason"] as const) {
        assert.notEqual(es[i][key], en[i][key], `${es[i].id}.${key}`);
        assert.doesNotMatch(es[i][key], /\{\d+\}/);
      }
      assert.deepEqual(generateActionPlan(userCase, now, "en"), en);
      assert.deepEqual(calculateFinancialGap(userCase, RESOURCES, now), gap);
      assert.deepEqual(matchResources(RESOURCES, userCase), matches);
      assert.deepEqual(classifyCase(userCase, now), status);
      assert.equal(JSON.stringify(userCase), saved);
    }
    assert.equal(network.mock.callCount(), 0);
  } finally { network.mock.restore(); }
});

test("all reviewed resource explanations and authored legal text have bundled translations", () => {
  for (const r of RESOURCES) for (const key of ["eligibilitySummary", "applicationMethod"] as const) {
    assert.notEqual(translate("es", r[key]), r[key], `${r.id}.${key}`);
  }
  for (const c of RIGHTS_CONTENT) {
    for (const value of [c.title, c.summary, ...c.points, ...(c.terms?.flatMap(t => [t.term, t.meaning]) ?? [])]) assert.notEqual(translate("es", value), value, value);
    assert.equal(translate("es", c.law ?? ""), c.law ?? "");
    for (const s of c.sources) assert.equal(translate("es", s.url), s.url);
  }
  for (const r of RESOURCES) assert.equal(translate("es", r.name), r.name);
});

test("existing validation messages translate at display time without resetting form state", () => {
  const result = intakeSchema.safeParse({});
  assert.equal(result.success, false);
  if (!result.success) for (const issue of result.error.issues) assert.notEqual(localizeAuthoredText("es", issue.message), issue.message, issue.message);
  assert.equal(localizeAuthoredText("es", "Enter your monthly rent (use 0 if none)"), "Ingresa tu alquiler mensual (usa 0 si no hay)");
});

test("history preserves user notes and ambiguous legacy details verbatim", () => {
  const c = applyCaseUpdate(resetMaria(now), { type: "LANDLORD_REJECTED_PLAN", note: "Today <mi nota>" }, now);
  const event = c.events.findLast(e => e.type === "LANDLORD_REJECTED_PLAN")!;
  const saved = JSON.stringify(event);
  assert.equal(presentCaseEvent(event, "es").title, "Mi arrendador rechazó mi plan de pagos — Today <mi nota>");
  const payment = { ...event, type: "PAYMENT_MADE", description: "Paid $123 toward rent — user words" };
  assert.deepEqual(presentCaseEvent(payment, "es"), { title: "Hice un pago", original: payment.description });
  assert.deepEqual(presentCaseEvent({ ...event, type: "UNKNOWN", description: "Unrecognized custom entry" }, "es"), { title: "Unrecognized custom entry" });
  assert.equal(JSON.stringify(event), saved);
});

test("formatting localizes civil dates without shifting days or monetary values", () => {
  assert.equal(formatDate("2026-10-11", undefined, "es"), "11 oct 2026");
  assert.equal(formatDate("2026-10-11", undefined, "en"), "Oct 11, 2026");
  assert.equal(formatMoney(1400, "es"), formatMoney(1400, "en")); // USD in es-US
  const prefs = { maxRent: 1200, bedrooms: 3, county: "Fulton", needsTransit: true };
  const en = housingGuidance(prefs, resetMaria(now), now, "en"), es = housingGuidance(prefs, resetMaria(now), now, "es");
  assert.deepEqual(en.categories, es.categories);
  assert.equal(en.affordableRent, es.affordableRent);
  assert.equal(en.urgent, es.urgent);
  assert.notDeepEqual(en.tips, es.tips);
});

test("offline bilingual message keeps exact cents, dates, names and unpaid balance", () => {
  const facts = { totalOwed: 1400.23, landlordName: "Mr. English Name", installments: [{ amount: 500.12, dueDate: "2026-10-11", label: "untrusted note" }] };
  const es = landlordTemplate(facts, "es"), en = landlordTemplate(facts, "en");
  assert.match(es.message, /Mr\. English Name/);
  assert.match(es.message, /500\.12/);
  assert.match(es.message, /900\.11/);
  assert.match(es.message, /11 oct 2026/);
  assert.match(en.message, /Oct 11, 2026/);
  assert.doesNotMatch(es.message, /untrusted note/);
});

test("Claude validates selected language and drafts directly in one existing model request", async () => {
  const old = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = "test-only-placeholder";
  const base = { totalOwed: 100, installments: [{ amount: 100, dueDate: "2026-10-11", label: "Payment" }] };
  assert.equal(draftRequestSchema.safeParse({ ...base, language: "fr" }).success, false);
  assert.equal(draftRequestSchema.parse(base).language, "en");
  const client = getAnthropic();
  const parser = mock.method(client.beta.messages, "parse", async () => ({ stop_reason: "end_turn", parsed_output: { subject: "Propuesta", message: "Mensaje" } }));
  try {
    assert.equal((await draftLandlordMessage(draftRequestSchema.parse({ ...base, language: "es" }))).subject, "Propuesta");
    assert.equal(parser.mock.callCount(), 1);
    const call = parser.mock.calls[0].arguments[0] as unknown as { system: string; messages: { content: string }[] };
    assert.match(call.system, /directly in Spanish/);
    assert.match(call.messages[0].content, /"output_language": "Spanish"/);
  } finally { parser.mock.restore(); if (old === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = old; }
});

test("narration selects a matching local voice, and paid route requires consent and configuration", async () => {
  assert.equal(selectLocalVoice([{ lang: "es-US", localService: false }, { lang: "en-US", localService: true }], "es"), undefined);
  assert.deepEqual(selectLocalVoice([{ lang: "es-MX", localService: true }], "es"), { lang: "es-MX", localService: true });
  const network = mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected paid request"); });
  const old = process.env.ELEVENLABS_API_KEY;
  delete process.env.ELEVENLABS_API_KEY;
  try {
    const request = (body: unknown) => new Request("http://localhost/api/speech", { method: "POST", headers: { origin: "http://localhost" }, body: JSON.stringify(body) });
    assert.equal((await speech(request({ text: "Hola", language: "es" }))).status, 400);
    assert.equal((await speech(request({ text: "Hola", language: "es", consentToVoiceProcessing: true }))).status, 503);
    assert.equal(network.mock.callCount(), 0);
  } finally { network.mock.restore(); if (old !== undefined) process.env.ELEVENLABS_API_KEY = old; }
});

test("all literal translation calls have bundled Spanish coverage", async () => {
  const { readdir, readFile } = await import("node:fs/promises");
  const ts = await import("typescript");
  async function audit(dir: string): Promise<void> {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) { await audit(path); continue; }
      if (!/\.tsx?$/.test(path)) continue;
      const source = ts.createSourceFile(path, await readFile(path, "utf8"), ts.ScriptTarget.Latest, true);
      const visit = (node: import("typescript").Node) => {
        if (ts.isCallExpression(node) && node.expression.getText(source) === "tr" && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
          assert.ok(Object.hasOwn(spanish, node.arguments[0].text), `${path}: ${node.arguments[0].text}`);
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
  }
  await audit("app"); await audit("components"); await audit("lib/services"); await audit("lib/engine");
});

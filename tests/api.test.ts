import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { POST as create, PUT as sync } from "@/app/api/case/route";
import { POST as document } from "@/app/api/document/route";
import { POST as draft } from "@/app/api/draft-message/route";
import { resetMaria, mariaIntake } from "@/lib/demo/mariaSeed";
import { persistCase } from "@/lib/services/casePersistence";
import { storeDocument } from "@/lib/services/documentService";
import { getAllResources } from "@/lib/services/resourceService";
import { authorizeAI, boundedBody } from "@/lib/services/requestSafety";
import { getAnthropic } from "@/lib/anthropic";
import { aiErrorResponse, AIRefusedError } from "@/lib/ai/errors";
import { draftRequestSchema } from "@/lib/ai/messageDrafter";

const json = (value: unknown, method = "POST") => new Request("http://localhost/api/case", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(value) });
const formRequest = (form: FormData, token?: string) => new Request("http://localhost/api/document", { method: "POST", body: form, headers: token ? { authorization: `Bearer ${token}` } : undefined });
const now = new Date("2026-10-10T16:00:00Z");

test("case POST works offline and returns no server retention", async () => {
  const res = await create(json({ sessionId: "guest-a", intake: mariaIntake() }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.persisted, false);
  assert.equal(body.storageMode, "BROWSER_ONLY");
  assert.equal(body.case.caseStatus, "LEGAL_HELP_RECOMMENDED");
  assert.ok(body.actionPlan.some((a: { id: string }) => a.id === "contact-legal-aid"));
});
test("malformed nested PUT and malformed JSON return 400", async () => {
  for (const value of [null, { sessionId: "a", case: { id: "victim", evictionStage: "UNSURE" } }, { sessionId: "a", case: { ...resetMaria(now), events: [{}] } }]) {
    assert.equal((await sync(json(value, "PUT"))).status, 400);
  }
  assert.equal((await create(new Request("http://localhost", { method: "POST", body: "not json" }))).status, 400);
});
test("untrusted case ID/session cannot overwrite data even with Supabase configured", async () => {
  const old = { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY };
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://never-called.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-not-a-secret";
  const network = mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected cloud call"); });
  try {
    const c = { ...resetMaria(now), id: "another-persons-case" };
    const res = await sync(json({ sessionId: "attacker", case: c }, "PUT"));
    assert.equal(res.status, 200);
    assert.equal((await res.json()).persisted, false);
    assert.equal(await persistCase("attacker", c), false);
    assert.equal(await storeDocument({ sessionId: "../../victim", fileName: "private.pdf", bytes: new ArrayBuffer(0), mimeType: "application/pdf", extracted: { confidence: "LOW" } }), null);
    assert.equal((await getAllResources()).source, "static");
    assert.equal(network.mock.callCount(), 0);
  } finally {
    network.mock.restore();
    if (old.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = old.url;
    if (old.key === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = old.key;
  }
});
test("request limit checks actual bytes without trusting content-length", async () => {
  await assert.rejects(boundedBody(new Request("http://localhost", { method: "POST", body: "123456" }), 5), /too large/);
  const res = await sync(new Request("http://localhost", { method: "PUT", body: "x".repeat(256 * 1024 + 1) }));
  assert.equal(res.status, 413);
});
test("document sample returns seeded output without any network or key", async () => {
  const network = mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected AI call"); });
  try {
    const f = new FormData(); f.set("demo", "1");
    const res = await document(formRequest(f));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.processing, "SEEDED_SAMPLE_NO_AI");
    assert.equal(body.simulated, true);
    assert.equal(body.stored, false);
    assert.equal(body.extracted.amountClaimed, 1400);
    assert.equal(network.mock.callCount(), 0);
  } finally { network.mock.restore(); }
});
test("document rejects malformed multipart, missing/empty/unsupported files and missing consent", async () => {
  assert.equal((await document(new Request("http://localhost", { method: "POST", body: "not multipart" }))).status, 400);
  assert.equal((await document(formRequest(new FormData()))).status, 400);
  const f = new FormData(); f.set("file", new Blob(["test"], { type: "text/plain" }), "bad.txt");
  assert.equal((await document(formRequest(f))).status, 415);
  f.set("file", new Blob([], { type: "application/pdf" }), "empty.pdf");
  assert.equal((await document(formRequest(f))).status, 400);
  f.set("file", new Blob(["%PDF-1.7"], { type: "application/pdf" }), "private.pdf");
  assert.equal((await document(formRequest(f))).status, 400);
});
test("public AI disabled without operator configuration; token checked and calls bounded", async () => {
  const oldKey = process.env.ANTHROPIC_API_KEY, oldToken = process.env.HOMEPATH_AI_ACCESS_TOKEN;
  try {
    delete process.env.ANTHROPIC_API_KEY; delete process.env.HOMEPATH_AI_ACCESS_TOKEN;
    assert.equal((await draft(json({}))).status, 503);
    process.env.ANTHROPIC_API_KEY = "test-only";
    process.env.HOMEPATH_AI_ACCESS_TOKEN = "test-only-operator-token-with-at-least-32-characters";
    assert.throws(() => authorizeAI(json({}), 1_000_000), /authorization/);
    const authorized = new Request("http://localhost", { headers: { authorization: `Bearer ${process.env.HOMEPATH_AI_ACCESS_TOKEN}` } });
    for (let i = 0; i < 5; i++) authorizeAI(authorized, 1_000_000);
    assert.throws(() => authorizeAI(authorized, 1_000_000), /limit/);
  } finally {
    if (oldKey === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = oldKey;
    if (oldToken === undefined) delete process.env.HOMEPATH_AI_ACCESS_TOKEN; else process.env.HOMEPATH_AI_ACCESS_TOKEN = oldToken;
  }
});
test("AI service failure returns safe error and stores nothing", async () => {
  const oldKey = process.env.ANTHROPIC_API_KEY, oldToken = process.env.HOMEPATH_AI_ACCESS_TOKEN;
  process.env.ANTHROPIC_API_KEY = "test-only";
  process.env.HOMEPATH_AI_ACCESS_TOKEN = "test-only-operator-token-with-at-least-32-characters";
  const parse = mock.method(getAnthropic().beta.messages, "parse", async () => { throw new Error("Sensitive tenant data that must not be returned or logged"); });
  const logs = mock.method(console, "error", () => {});
  try {
    const f = new FormData(); f.set("consentToAIProcessing", "true");
    f.set("file", new Blob(["%PDF-1.7"], { type: "application/pdf" }), "private.pdf");
    const res = await document(formRequest(f, process.env.HOMEPATH_AI_ACCESS_TOKEN));
    assert.equal(res.status, 500);
    assert.equal(parse.mock.callCount(), 1);
    assert.ok(!(await res.text()).includes("Sensitive"));
    assert.ok(!JSON.stringify(logs.mock.calls).includes("Sensitive"));
    assert.equal(aiErrorResponse(new AIRefusedError("Cannot read sample"), "test")[1].status, 422);
  } finally {
    parse.mock.restore(); logs.mock.restore();
    if (oldKey === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = oldKey;
    if (oldToken === undefined) delete process.env.HOMEPATH_AI_ACCESS_TOKEN; else process.env.HOMEPATH_AI_ACCESS_TOKEN = oldToken;
  }
});
test("draft contract rejects overpayment and impossible dates", () => {
  assert.equal(draftRequestSchema.safeParse({ totalOwed: 1, installments: [{ amount: 2, dueDate: "2026-10-10", label: "Payment" }] }).success, false);
  assert.equal(draftRequestSchema.safeParse({ totalOwed: 1, installments: [{ amount: 1, dueDate: "2026-02-30", label: "Payment" }] }).success, false);
});

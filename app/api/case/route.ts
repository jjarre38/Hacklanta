import { NextResponse } from "next/server";
import { z } from "zod";
import { userCaseSchema } from "@/lib/validation/case";
import { boundedJson, requestError, requestStatus } from "@/lib/services/requestSafety";
import { intakeSchema } from "@/lib/intake/schema";
import { createCaseFromIntake, reclassify } from "@/lib/services/caseService";
import { persistCase } from "@/lib/services/casePersistence";
import { classifyCase } from "@/lib/engine/caseClassifier";
import { generateActionPlan } from "@/lib/services/recommendationService";

const postBody = z.object({
  sessionId: z.string().min(1).max(100),
  intake: intakeSchema,
});

/** POST: create a case from intake answers, classify it, and return it. */
export async function POST(req: Request) {
  let body: unknown;
  try { body = await boundedJson(req); } catch (err) { return NextResponse.json(requestError(err), { status: requestStatus(err) }); }
  const parsed = postBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid intake data" }, { status: 400 });
  }
  const now = new Date();
  const userCase = createCaseFromIntake(parsed.data.intake, now);
  const persisted = await persistCase(parsed.data.sessionId, userCase);
  return NextResponse.json({
    case: userCase,
    classification: classifyCase(userCase, now),
    actionPlan: generateActionPlan(userCase, now),
    persisted,
    storageMode: "BROWSER_ONLY",
  });
}

const putBody = z.object({
  sessionId: z.string().min(1).max(100),
  case: userCaseSchema,
});

/** PUT: sync an updated case (re-classified server-side) to Supabase if configured. */
export async function PUT(req: Request) {
  let body: unknown;
  try { body = await boundedJson(req); } catch (err) { return NextResponse.json(requestError(err), { status: requestStatus(err) }); }
  const parsed = putBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid case data" }, { status: 400 });
  }
  const userCase = reclassify(parsed.data.case);
  const persisted = await persistCase(parsed.data.sessionId, userCase);
  return NextResponse.json({ case: userCase, persisted, storageMode: "BROWSER_ONLY" });
}

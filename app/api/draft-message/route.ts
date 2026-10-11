import { authorizeAI, boundedJson, requestError, requestStatus } from "@/lib/services/requestSafety";
import { NextResponse } from "next/server";
import { draftLandlordMessage, draftRequestSchema } from "@/lib/ai/messageDrafter";
import { aiErrorResponse } from "@/lib/ai/errors";

export const maxDuration = 60;

/** POST: turn a deterministic payment plan into a drafted landlord message. */
export async function POST(req: Request) {
  let body: unknown;
  try { await authorizeAI(req); body = await boundedJson(req); }
  catch (err) { return NextResponse.json(requestError(err), { status: requestStatus(err) }); }
  if (!body || typeof body !== "object" || !("consentToAIProcessing" in body) || body.consentToAIProcessing !== true) {
    return NextResponse.json({ error: "Consent is required to send plan details to Anthropic." }, { status: 400 });
  }
  const parsed = draftRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment plan data." }, { status: 400 });
  }
  try {
    return NextResponse.json(await draftLandlordMessage(parsed.data));
  } catch (err) {
    return NextResponse.json(...aiErrorResponse(err, "draft-message"));
  }
}

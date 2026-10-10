import { NextResponse } from "next/server";
import { draftLandlordMessage, draftRequestSchema } from "@/lib/ai/messageDrafter";
import { aiErrorResponse } from "@/lib/ai/errors";

export const maxDuration = 60;

/** POST: turn a deterministic payment plan into a drafted landlord message. */
export async function POST(req: Request) {
  const parsed = draftRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment plan data." }, { status: 400 });
  }
  try {
    return NextResponse.json(await draftLandlordMessage(parsed.data));
  } catch (err) {
    return NextResponse.json(...aiErrorResponse(err, "draft-message"));
  }
}

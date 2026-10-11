import { NextResponse } from "next/server";
import { extractDocument, SUPPORTED_MIME_TYPES, type SupportedMimeType } from "@/lib/ai/documentParser";
import { aiErrorResponse } from "@/lib/ai/errors";
import { sampleExtractedDocument } from "@/lib/demo/sampleNotice";
import { authorizeAI, boundedBody, RequestError, requestError, requestStatus } from "@/lib/services/requestSafety";

export const maxDuration = 60;
const MAX_BYTES = 10 * 1024 * 1024;

/** Sample is offline. Real documents require explicit processing consent and a private operator token.
 * No documents, filenames, or extraction results are persisted by this route. */
export async function POST(req: Request) {
  let form: FormData;
  try {
    const bytes = await boundedBody(req, MAX_BYTES + 64 * 1024);
    form = await new Response(bytes as BodyInit, { headers: { "content-type": req.headers.get("content-type") ?? "" } }).formData();
  } catch (err) {
    return NextResponse.json(requestError(err), { status: requestStatus(err) });
  }
  if (form.get("demo") === "1") {
    return NextResponse.json({ extracted: sampleExtractedDocument(), stored: false, demo: true, simulated: true, processing: "SEEDED_SAMPLE_NO_AI" });
  }
  try {
    const file = form.get("file");
    if (!file || typeof file === "string" || file.size === 0) throw new RequestError("Choose a nonempty file to upload.", 400);
    if (!SUPPORTED_MIME_TYPES.includes(file.type as SupportedMimeType)) throw new RequestError("Please upload a PDF or a supported image.", 415);
    if (file.size > MAX_BYTES) throw new RequestError("That file is larger than 10 MB.", 413);
    if (form.get("consentToAIProcessing") !== "true") throw new RequestError("Consent is required before sending a sensitive document to Anthropic for processing.", 400);
    authorizeAI(req);
    const bytes = await file.arrayBuffer();
    const extracted = await extractDocument({ kind: "file", mimeType: file.type as SupportedMimeType, base64: Buffer.from(bytes).toString("base64") });
    return NextResponse.json({ extracted, stored: false, processing: "ANTHROPIC", requiresUserConfirmation: true });
  } catch (err) {
    if (err instanceof RequestError) return NextResponse.json(requestError(err), { status: requestStatus(err) });
    return NextResponse.json(...aiErrorResponse(err, "document"));
  }
}

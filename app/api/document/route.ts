import { NextResponse } from "next/server";
import { extractDocument, SUPPORTED_MIME_TYPES, type SupportedMimeType } from "@/lib/ai/documentParser";
import { aiErrorResponse } from "@/lib/ai/errors";
import { storeDocument } from "@/lib/services/documentService";
import { sampleNoticeText } from "@/lib/demo/sampleNotice";

export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * POST multipart/form-data:
 *   file       — PDF or image of an eviction notice / court document
 *   sessionId  — guest session ID
 *   demo=1     — use the built-in sample notice instead of a file
 * Returns { extracted: ExtractedDocument, stored: boolean }.
 */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected a file upload." }, { status: 400 });
  }
  const sessionId = String(form.get("sessionId") ?? "").slice(0, 100) || "anonymous";

  try {
    if (form.get("demo") === "1") {
      const extracted = await extractDocument({ kind: "text", text: sampleNoticeText() });
      return NextResponse.json({ extracted, stored: false, demo: true });
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
    }
    if (!SUPPORTED_MIME_TYPES.includes(file.type as SupportedMimeType)) {
      return NextResponse.json({ error: "Please upload a PDF or a photo (JPG, PNG, or WebP)." }, { status: 415 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "That file is larger than 10 MB. Try a smaller photo or PDF." }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const extracted = await extractDocument({
      kind: "file",
      mimeType: file.type as SupportedMimeType,
      base64: Buffer.from(bytes).toString("base64"),
    });
    const stored = await storeDocument({ sessionId, fileName: file.name, mimeType: file.type, bytes, extracted });
    return NextResponse.json({ extracted, stored: Boolean(stored) });
  } catch (err) {
    return NextResponse.json(...aiErrorResponse(err, "document"));
  }
}

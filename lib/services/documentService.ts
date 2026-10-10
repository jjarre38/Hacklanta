import "server-only";
import type { ExtractedDocument } from "@/types";
import { DOCUMENTS_BUCKET, getSupabaseServerClient } from "@/lib/supabase";
import { makeId } from "@/lib/format";

// Stores uploaded documents in Supabase Storage and records the extraction.
// Both steps are skipped (returning null) when Supabase isn't configured —
// the file is still processed in memory and never written to disk.

export async function storeDocument(params: {
  sessionId: string;
  caseId?: string;
  fileName: string;
  mimeType: string;
  bytes: ArrayBuffer;
  extracted: ExtractedDocument;
}): Promise<{ storagePath: string } | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  const storagePath = `${params.sessionId}/${makeId("doc")}-${safeName}`;

  const upload = await supabase.storage.from(DOCUMENTS_BUCKET).upload(storagePath, params.bytes, {
    contentType: params.mimeType,
    upsert: false,
  });
  if (upload.error) {
    console.warn("[documents] storage upload failed:", upload.error.message);
    return null;
  }

  const { error } = await supabase.from("documents").insert({
    session_id: params.sessionId,
    case_id: null, // linked on confirmation; cases may exist only in localStorage
    storage_path: storagePath,
    file_name: safeName,
    mime_type: params.mimeType,
    extracted: params.extracted,
  });
  if (error) console.warn("[documents] insert failed:", error.message);
  return { storagePath };
}

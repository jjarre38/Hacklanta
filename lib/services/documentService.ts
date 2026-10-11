import "server-only";
import type { ExtractedDocument } from "@/types";

/** No document or extraction retention in the public guest demo. */
export async function storeDocument(_params: {
  sessionId: string; caseId?: string; fileName: string; mimeType: string;
  bytes: ArrayBuffer; extracted: ExtractedDocument;
}): Promise<{ storagePath: string } | null> {
  void _params; // Compatibility stub: deliberately no storage or logging.
  return null;
}

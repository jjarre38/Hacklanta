import "server-only";
import type { UserCase } from "@/types";

/** Guest IDs are not authorization. Persistence is intentionally disabled,
 * including when Supabase credentials exist. Re-enable only with ownership checks. */
export async function persistCase(_sessionId: string, _c: UserCase): Promise<boolean> {
  void _sessionId; void _c; // Preserve the existing caller contract without retaining inputs.
  return false;
}

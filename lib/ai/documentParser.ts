import "server-only";
import { z } from "zod";
import type { BetaContentBlockParam } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { ExtractedDocument } from "@/types";
import { CLAUDE_MODEL, getAnthropic } from "@/lib/anthropic";
import { AIRefusedError } from "./errors";

// Claude reads an eviction notice or court document and returns structured
// fields. Output is constrained by a schema and then re-validated so bad data
// can never reach the case. Fields Claude isn't sure about come back null.

export const SUPPORTED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"] as const;
export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

const extractionSchema = z.object({
  landlordName: z.string().nullable(),
  tenantName: z.string().nullable(),
  amountClaimed: z.number().nullable(),
  filingDate: z.string().nullable(),
  courtDate: z.string().nullable(),
  caseNumber: z.string().nullable(),
  county: z.string().nullable(),
  deadlines: z.array(z.string()).nullable(),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

const SYSTEM_PROMPT = `You extract information from Georgia eviction notices and court documents (such as dispossessory warrants, summonses, demand letters, and judgments) for a tenant.

Return ONLY valid JSON. If a field cannot be determined with confidence, return null. Do not guess.

Field rules:
- landlordName: the landlord / plaintiff, as written.
- tenantName: the tenant / defendant, as written.
- amountClaimed: the total amount the landlord claims, as a number without symbols. null if not stated.
- filingDate, courtDate: dates in YYYY-MM-DD format. courtDate is the hearing date only. null if not stated or unreadable.
- caseNumber: the court case / civil action file number, exactly as written.
- county: the county name only (e.g. "Fulton"), without the word "County".
- deadlines: short plain-language descriptions of any deadlines stated in the document (e.g. "Answer within 7 days of being served"). Empty list if none.
- confidence: HIGH if the document is clear and the key fields are present; MEDIUM if some fields were unclear; LOW if the image is hard to read, it may not be an eviction document, or most fields are missing.`;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type ExtractionInput =
  | { kind: "file"; mimeType: SupportedMimeType; base64: string }
  | { kind: "text"; text: string };

export async function extractDocument(input: ExtractionInput): Promise<ExtractedDocument> {
  const client = getAnthropic();

  const source: BetaContentBlockParam =
    input.kind === "text"
      ? { type: "document", source: { type: "text", media_type: "text/plain", data: input.text } }
      : input.mimeType === "application/pdf"
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: input.base64 } }
        : { type: "image", source: { type: "base64", media_type: input.mimeType, data: input.base64 } };

  const response = await client.beta.messages.parse({
    model: CLAUDE_MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM_PROMPT,
    output_config: { effort: "medium", format: betaZodOutputFormat(extractionSchema) },
    messages: [
      {
        role: "user",
        content: [source, { type: "text", text: "Extract the fields from this document." }],
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new AIRefusedError("We couldn't read this document. Please enter the details yourself.");
  }
  const parsed = extractionSchema.safeParse(response.parsed_output);
  if (!parsed.success) throw new AIRefusedError("We couldn't read this document reliably. Please enter the details yourself.");

  return sanitize(parsed.data);
}

/** Enforce formats the schema can't express, nulling anything malformed. */
function sanitize(d: z.infer<typeof extractionSchema>): ExtractedDocument {
  const date = (v: string | null) => (v && ISO_DATE.test(v) && !Number.isNaN(Date.parse(v)) ? v : null);
  const text = (v: string | null, max = 160) => (v && v.trim() ? v.trim().slice(0, max) : null);
  const amount = d.amountClaimed !== null && Number.isFinite(d.amountClaimed) && d.amountClaimed >= 0 && d.amountClaimed < 1_000_000 ? d.amountClaimed : null;
  return {
    landlordName: text(d.landlordName),
    tenantName: text(d.tenantName),
    amountClaimed: amount,
    filingDate: date(d.filingDate),
    courtDate: date(d.courtDate),
    caseNumber: text(d.caseNumber, 60),
    county: text(d.county?.replace(/county/i, "") ?? null, 40),
    deadlines: d.deadlines ? d.deadlines.map((x) => x.trim()).filter(Boolean).slice(0, 6) : null,
    confidence: d.confidence,
  };
}

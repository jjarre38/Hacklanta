"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import { ExternalLink, Phone, Scale } from "lucide-react";
import { LEGAL_DISCLAIMER } from "@/lib/copy";
import { RightsList } from "./RightsList";



export default function RightsPage() {
  const { locale, text, tr } = useI18n();
  return (
    <div className="container-page py-8 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tr("Know your rights in Georgia")}</h1>
      <p className="mt-1 max-w-2xl text-ink-soft">{tr("Plain-language answers about how evictions work in Georgia, what your landlord can and can't do, and your deadlines.")}</p>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4" role="note">
        <Scale className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden />
        <p className="text-sm font-medium text-brand-900">{text(LEGAL_DISCLAIMER)}</p>
      </div>

      {locale === "es" && <p role="note" className="mt-3 text-sm text-ink-muted">{tr("The Spanish translation has not been reviewed by an attorney. Fluent bilingual and legal review is needed. Citations and links retain their original sources.")}</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a
          href="https://atlantalegalaid.org"
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-3 rounded-2xl bg-sage-600 p-4 text-white shadow-soft hover:bg-sage-700"
        >
          <Phone className="h-6 w-6 shrink-0" aria-hidden />
          <span className="flex-1">
            <span className="block font-semibold">Atlanta Legal Aid Society</span>
            <span className="text-sm text-white/90">{tr("Free help in Fulton, DeKalb, Cobb, Gwinnett & Clayton · 404-524-5811")}</span>
          </span>
          <ExternalLink className="h-5 w-5" aria-hidden />
        </a>
        <a
          href="https://www.georgialegalaid.org"
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-3 rounded-2xl border border-sage-300 bg-white p-4 shadow-soft hover:border-sage-500"
        >
          <Scale className="h-6 w-6 shrink-0 text-sage-700" aria-hidden />
          <span className="flex-1">
            <span className="block font-semibold">GeorgiaLegalAid.org</span>
            <span className="text-sm text-ink-muted">{tr("Free guides and forms for tenants statewide")}</span>
          </span>
          <ExternalLink className="h-5 w-5 text-sage-700" aria-hidden />
        </a>
      </div>

      <div className="mt-8">
        <RightsList />
      </div>
    </div>
  );
}

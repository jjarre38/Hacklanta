"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import Link from "next/link";
import { Lock, Scale } from "lucide-react";
import { LEGAL_DISCLAIMER, PRIVACY_NOTE } from "@/lib/copy";

export function Footer() {
  const { text, tr } = useI18n();
  return (
    <footer className="mt-8 border-t border-violet-200 bg-violet-50 md:mt-16">
      <div className="container-page grid gap-3 py-5 md:grid-cols-3 md:gap-8 md:py-10">
        <div>
          <p className="text-sm font-semibold text-violet-950 md:text-base">HomePath</p>
          <p className="mt-2 hidden text-sm text-ink-muted md:block">
            {tr("Eviction prevention and housing stability for Metro Atlanta renters. Built for a hackathon demo.")}</p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Scale className="mt-0.5 h-4 w-4 shrink-0 text-violet-700 md:h-5 md:w-5" aria-hidden />
          <p className="text-xs text-ink-soft md:text-sm">{text(LEGAL_DISCLAIMER)}</p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-violet-700 md:h-5 md:w-5" aria-hidden />
          <p className="text-xs text-ink-soft md:text-sm">{text(PRIVACY_NOTE)}</p>
        </div>
      </div>
      <div className="border-t border-violet-200">
        <div className="container-page flex flex-col gap-2 py-3 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between md:py-4">
          <p className="hidden sm:block">{tr("Resource listings and impact numbers are demo data. Confirm details directly with each organization.")}</p>
          <p className="sm:hidden">{tr("Listings are demo data — confirm with each organization.")}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-violet-800">
            <Link href="/rights" className="hover:text-ink">
              {tr("Know your rights")}</Link>
            <Link href="/resources" className="hover:text-ink">
              {tr("Resources")}</Link>
            <Link href="/payment-plan" className="hover:text-ink">
              {tr("Payment plan")}<span className="hidden sm:inline"> {tr(" calculator")}</span>
            </Link>
            <a href="tel:211" className="whitespace-nowrap hover:text-ink">
              {tr("Call 2-1-1")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

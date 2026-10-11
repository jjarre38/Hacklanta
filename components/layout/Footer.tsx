import Link from "next/link";
import { Lock, Scale } from "lucide-react";
import { LEGAL_DISCLAIMER, PRIVACY_NOTE } from "@/lib/copy";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-slate-200 bg-white md:mt-16">
      <div className="container-page grid gap-3 py-5 md:grid-cols-3 md:gap-8 md:py-10">
        <div>
          <p className="text-sm font-semibold text-ink md:text-base">HomePath</p>
          <p className="mt-2 hidden text-sm text-ink-muted md:block">
            Eviction prevention and housing stability for Metro Atlanta renters. Built for a hackathon demo.
          </p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Scale className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 md:h-5 md:w-5" aria-hidden />
          <p className="text-xs text-ink-soft md:text-sm">{LEGAL_DISCLAIMER}</p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-sage-600 md:h-5 md:w-5" aria-hidden />
          <p className="text-xs text-ink-soft md:text-sm">{PRIVACY_NOTE}</p>
        </div>
      </div>
      <div className="border-t border-slate-100">
        <div className="container-page flex flex-col gap-2 py-3 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between md:py-4">
          <p className="hidden sm:block">Resource listings and impact numbers are demo data. Confirm details directly with each organization.</p>
          <p className="sm:hidden">Listings are demo data — confirm with each organization.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/rights" className="hover:text-ink">
              Know your rights
            </Link>
            <Link href="/resources" className="hover:text-ink">
              Resources
            </Link>
            <Link href="/payment-plan" className="hover:text-ink">
              Payment plan<span className="hidden sm:inline"> calculator</span>
            </Link>
            <a href="tel:211" className="whitespace-nowrap hover:text-ink">
              Call 2-1-1
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

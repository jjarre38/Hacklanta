import Link from "next/link";
import { Lock, Scale } from "lucide-react";
import { LEGAL_DISCLAIMER, PRIVACY_NOTE } from "@/lib/copy";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-page grid gap-8 py-10 md:grid-cols-3">
        <div>
          <p className="text-base font-semibold text-ink">HomePath</p>
          <p className="mt-2 text-sm text-ink-muted">
            Eviction prevention and housing stability for Metro Atlanta renters. Built for a hackathon demo.
          </p>
        </div>
        <div className="flex gap-3">
          <Scale className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
          <p className="text-sm text-ink-soft">{LEGAL_DISCLAIMER}</p>
        </div>
        <div className="flex gap-3">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-sage-600" aria-hidden />
          <p className="text-sm text-ink-soft">{PRIVACY_NOTE}</p>
        </div>
      </div>
      <div className="border-t border-slate-100">
        <div className="container-page flex flex-col gap-2 py-4 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Resource listings and impact numbers are demo data. Confirm details directly with each organization.</p>
          <div className="flex gap-4">
            <Link href="/rights" className="hover:text-ink">
              Know your rights
            </Link>
            <Link href="/resources" className="hover:text-ink">
              Resources
            </Link>
            <Link href="/payment-plan" className="hover:text-ink">
              Payment plan calculator
            </Link>
            <a href="tel:211" className="hover:text-ink">
              Call 2-1-1
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

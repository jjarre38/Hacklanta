"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Home, Menu, X } from "lucide-react";
import { useCase } from "@/lib/client/caseStore";

const LINKS = [
  { href: "/dashboard", label: "My Plan" },
  { href: "/resources", label: "Resources" },
  { href: "/rights", label: "Know Your Rights" },
  { href: "/housing", label: "Housing" },
  { href: "/employment", label: "Employment" },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-sage-500 text-white shadow-sm">
        <Home className="h-5 w-5" aria-hidden />
      </span>
      <span className="text-lg tracking-tight">
        Home<span className="text-brand-600">Path</span>
      </span>
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { userCase, loaded } = useCase();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(l.href) ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:bg-slate-100 hover:text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
          {loaded && !userCase && (
            <Link href="/intake" className="ml-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              Get started
            </Link>
          )}
        </div>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-ink hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-page flex flex-col py-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  "rounded-lg px-3 py-3 text-base font-medium",
                  pathname.startsWith(l.href) ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-slate-100",
                )}
              >
                {l.label}
              </Link>
            ))}
            {loaded && !userCase && (
              <Link href="/intake" className="mt-2 rounded-lg bg-brand-600 px-3 py-3 text-center text-base font-semibold text-white">
                Build My Action Plan
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

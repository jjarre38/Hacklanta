"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { useCase } from "@/lib/client/caseStore";

const LINKS = [
  { href: "/dashboard", label: "My Plan" },
  { href: "/resources", label: "Resources" },
  { href: "/rights", label: "Know Your Rights" },
  { href: "/housing", label: "Housing" },
  { href: "/employment", label: "Employment" },
];

/** Pages that use the wider `container-wide` layout; the nav matches them so the logo lines up with the content. */
const WIDE_PAGES = ["/dashboard"];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={clsx("flex items-center gap-2 font-semibold", light ? "text-white" : "text-ink")}>
      <Image src="/images/homepath-logo.svg" alt="" width={44} height={44} className="h-11 w-11 shrink-0" />
      <span className="text-lg tracking-tight">
        Home<span className={light ? "text-[#dfcff3]" : "text-brand-600"}>Path</span>
      </span>
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { userCase, loaded } = useCase();

  useEffect(() => setOpen(false), [pathname]);

  const container = WIDE_PAGES.some((p) => pathname.startsWith(p)) ? "container-wide" : "container-page";
  const landing = pathname === "/";

  return (
    <header className={clsx("z-40", landing ? "absolute inset-x-0 top-0 border-b border-white/10 bg-[#291b3a]/20" : "sticky top-0 border-b border-white/10 bg-[#302044]/95 backdrop-blur")}>
      <nav className={clsx(container, "flex h-20 items-center justify-between")} aria-label="Main">
        <Logo light />
        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(l.href) ? "bg-white/15 text-white" : "text-slate-200 hover:bg-white/10 hover:text-white",
              )}
            >
              {l.label}
            </Link>
          ))}
          {loaded && !userCase && (
            <Link href="/intake" className={clsx("ml-2 rounded-md px-4 py-2 text-sm font-semibold text-white", landing ? "bg-[#8464b0] hover:bg-[#705098]" : "bg-brand-600 hover:bg-brand-700")}>
              Get started
            </Link>
          )}
        </div>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-white hover:bg-white/10 lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
      {open && (
        <div id="mobile-navigation" className="border-t border-slate-200 bg-white lg:hidden">
          <div className={clsx(container, "flex flex-col py-2")}>
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

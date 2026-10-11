"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { MapPin } from "lucide-react";

const BANNERS: Record<string, { label: string; title: string; subtitle: string; image: string }> = {
  "/intake": { label: "Your first step", title: "A clear path starts here.", subtitle: "A few questions. A plan built around you.", image: "step-questions.jpg" },
  "/dashboard": { label: "Your personal plan", title: "One step closer to stability.", subtitle: "Local support and practical next steps, all in one place.", image: "atlanta-sunset-hero.jpg" },
  "/resources": { label: "Local connections", title: "Support, closer to home.", subtitle: "Explore the programs and people who can help.", image: "atlanta-cityscape.jpg" },
  "/rights": { label: "Knowledge brings clarity", title: "Understand your options.", subtitle: "Plain-language guidance for the road ahead.", image: "atlanta-skyline.jpg" },
  "/housing": { label: "Your next chapter", title: "Find a place to move forward.", subtitle: "Housing guidance and support for a steadier start.", image: "step-forward.jpg" },
  "/employment": { label: "Build your momentum", title: "A stronger foundation starts here.", subtitle: "Connect with opportunities to rebuild your income.", image: "step-support.jpg" },
  "/payment-plan": { label: "Make a plan", title: "A little more breathing room.", subtitle: "Turn your numbers into a manageable next step.", image: "step-plan.jpg" },
};

export function PageBanner() {
  const { text, tr } = useI18n();
  const pathname = usePathname();
  const banner = BANNERS[pathname];
  if (!banner) return null;
  const wide = pathname === "/dashboard";
  return (
    <section aria-label={text(banner.label)} className="relative isolate overflow-hidden bg-brand-900">
      <Image src={`/images/${banner.image}`} alt="" fill sizes="100vw" className="object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#21152f]/95 via-[#3a2850]/85 to-[#3a2850]/40" />
      <div className={`${wide ? "container-wide" : "container-page"} relative py-9 sm:py-12`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#dfcff3] sm:text-xs">{text(banner.label)}</p>
        <p className="mt-3 max-w-3xl text-3xl font-medium leading-tight tracking-tight text-white sm:text-4xl">{text(banner.title)}</p>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">{text(banner.subtitle)}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-slate-300"><MapPin className="h-3 w-3" aria-hidden /> {tr(" Here for Metro Atlanta renters")}</span>
      </div>
    </section>
  );
}

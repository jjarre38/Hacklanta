"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import Image from "next/image";
import { ArrowRight, ClipboardList, Compass, HandCoins, MapPin, Route, Scale, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { DemoBadge } from "@/components/ui/Badge";
import { SERVICE_COUNTIES, SERVICE_REGION_NAME } from "@/lib/data/serviceArea";
import { RESOURCES } from "@/lib/data/resources";

const STEPS = [
  { icon: ClipboardList, title: "Tell us your situation", body: "A few simple questions. No account, SSN, or bank information needed.", image: "step-questions", alt: "A person writing answers in a notebook" },
  { icon: Route, title: "Get a clear plan", body: "Know what to do today, before court, and in the week ahead.", image: "step-plan", alt: "Notes and planning materials on a desk" },
  { icon: HandCoins, title: "Connect with local help", body: "Find nearby support and build a payment plan that fits your situation.", image: "step-support", alt: "People working together around a table" },
  { icon: Compass, title: "Find your way forward", body: "If staying isn't possible, get support for a safe move and a fresh start.", image: "step-forward", alt: "A tree-lined city street leading toward the skyline" },
];
const SERVICES = [
  { icon: HandCoins, title: "Help with rent", body: "Find local assistance programs and explore a manageable payment plan.", href: "/resources", label: "Find resources" },
  { icon: Scale, title: "Clarity on your rights", body: "Understand the process and when to connect with legal help.", href: "/rights", label: "Know your rights" },
  { icon: Compass, title: "A path to stability", body: "Explore housing and practical support for your next chapter.", href: "/housing", label: "Explore housing" },
];
const METRICS = [
  { label: "Cases assisted", value: "1,284" },
  { label: "Evictions prevented", value: "412" },
  { label: "Connected to legal aid", value: "538" },
  { label: "Resources matched", value: "6,930" },
  { label: "Recovery plans created", value: "297" },
];

export default function LandingPage() {
  const { text, tr } = useI18n();
  return (
    <>
      <section className="relative isolate bg-[#2c1e40]" aria-labelledby="hero-heading">
        <Image src="/images/atlanta-sunset-hero.jpg" alt={tr("Atlanta skyline and snowy city streets beneath a soft sunset sky")} fill priority sizes="100vw" className="object-cover object-[center_55%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#21152f]/95 via-[#3a2850]/75 to-[#3a2850]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#21152f]/80 via-transparent to-[#21152f]/20" />
        <div className="container-page relative pb-36 pt-32 sm:pb-40 sm:pt-40 lg:pt-44">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#dac9ee]"><MapPin className="h-4 w-4" aria-hidden /> {tr(" Here for Metro Atlanta renters")}</p>
          <h1 id="hero-heading" className="mt-6 max-w-3xl text-balance text-5xl font-medium leading-[1.08] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">{tr("Keep your home.")}<br /><span className="text-[#dfcff3]">{tr("Find your next step.")}</span></h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-200 sm:text-lg">{tr("Free local help and a clear plan when rent gets hard.")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/intake" size="lg" className="!rounded-md !bg-[#756187] hover:!bg-[#635073]">{tr("Build my plan ")}<ArrowRight className="h-4 w-4" aria-hidden /></ButtonLink>
            <ButtonLink href="/resources" variant="outline" size="lg" className="!rounded-md !border-white/40 !bg-white/5 !text-white hover:!bg-white/15">{tr("Find local help")}</ButtonLink>
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-slate-300"><ShieldCheck className="h-4 w-4" aria-hidden /> {tr(" No account needed ")}<span className="mx-1" aria-hidden>·</span> {tr(" About 3 minutes")}</p>
        </div>
      </section>

      <section className="container-page relative z-10 -mt-20" aria-label={tr("Ways HomePath can help")}>
        <div className="grid gap-4 md:grid-cols-3">{SERVICES.map(({ icon: Icon, ...service }) => (
          <article key={service.href} className="flex flex-col items-center rounded-lg border border-slate-200/80 bg-white px-7 py-8 text-center shadow-lift">
            <Icon className="h-9 w-9 text-[#8464b0]" strokeWidth={1.5} aria-hidden />
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-[#352548]">{text(service.title)}</h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-ink-soft">{text(service.body)}</p>
            <ButtonLink href={service.href} size="sm" className="mt-6 !rounded-md !bg-[#8464b0] hover:!bg-[#705098]">{text(service.label)} <ArrowRight className="h-3.5 w-3.5" aria-hidden /></ButtonLink>
          </article>
        ))}</div>
      </section>

      <section id="how-it-works" className="container-page scroll-mt-24 py-20" aria-labelledby="how-heading">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#8464b0]">{tr("A little clarity goes a long way")}</p>
        <h2 id="how-heading" className="mt-3 text-center text-3xl font-semibold tracking-tight text-[#352548] sm:text-4xl">{tr("Four steps toward stability.")}</h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-sm leading-6 text-ink-soft">{tr("Start where you are. Your plan adapts as your situation changes.")}</p>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{STEPS.map(({ icon: Icon, ...step }, i) => (
          <li key={step.image} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
            <div className="relative aspect-[4/3]"><Image src={`/images/${step.image}.jpg`} alt={text(step.alt)} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" /><span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#352548] text-sm font-semibold text-white">0{i + 1}</span></div>
            <div className="p-5"><Icon className="h-5 w-5 text-[#8464b0]" aria-hidden /><h3 className="mt-3 text-lg font-semibold tracking-tight text-[#352548]">{text(step.title)}</h3><p className="mt-2 text-sm leading-6 text-ink-soft">{text(step.body)}</p></div>
          </li>
        ))}</ol>
      </section>

      <section className="bg-[#302044] py-16 sm:py-20" aria-labelledby="area-heading">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg"><Image src="/images/atlanta-cityscape.jpg" alt={tr("Downtown Atlanta and the SkyView Ferris wheel")} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /><span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-md bg-[#2b1c3b]/90 px-4 py-2 text-xs text-white"><MapPin className="h-3.5 w-3.5" aria-hidden /> {tr(" Metro Atlanta, Georgia")}</span></div>
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c4b0e5]">{tr("Local help. Close to home.")}</p><h2 id="area-heading" className="mt-4 text-3xl font-medium tracking-tight text-white sm:text-4xl">{tr("Built for {region}.", { region: text(SERVICE_REGION_NAME).replace(/^Área/, "área") })}</h2><p className="mt-5 text-base leading-7 text-slate-300">{tr("Connect with ")}{RESOURCES.length} {tr(" listed programs across ")}{SERVICE_COUNTIES.length} {tr(" counties, from rental assistance and legal aid to housing and family support.")}</p><ul className="mt-6 flex flex-wrap gap-2">{SERVICE_COUNTIES.map(county => <li key={county.name} className="rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-violet-100">{tr("{0} County", { 0: county.name })}</li>)}</ul><ButtonLink href="/intake" className="mt-7 !rounded-md !bg-[#8464b0] hover:!bg-[#705098]">{tr("Check my county ")}<ArrowRight className="h-4 w-4" aria-hidden /></ButtonLink><p className="mt-4 text-xs leading-5 text-slate-400">{tr("Resource listings and availability are demo data. Confirm details directly with each organization.")}</p></div>
        </div>
      </section>

      <section className="container-page py-16" aria-labelledby="impact-heading">
        <div className="flex flex-wrap items-center justify-center gap-3"><h2 id="impact-heading" className="text-2xl font-semibold tracking-tight text-[#352548]">{tr("What support can make possible")}</h2><DemoBadge label={tr("Illustrative demo data")} /></div>
        <dl className="mt-9 grid grid-cols-2 gap-6 text-center md:grid-cols-5">{METRICS.map(metric => <div key={metric.label}><dt className="text-sm text-ink-muted">{text(metric.label)}</dt><dd className="mt-2 text-3xl font-semibold tracking-tight text-[#654887]">{metric.value}</dd></div>)}</dl><p className="mt-6 text-center text-xs text-ink-muted">{tr("Simulated for demonstration. These figures do not represent real outcomes.")}</p>
      </section>
    </>
  );
}

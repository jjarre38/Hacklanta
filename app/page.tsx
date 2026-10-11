import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Compass,
  HandCoins,
  HeartHandshake,
  MapPin,
  Route,
  Scale,
  Search,
  ShieldCheck,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { SERVICE_COUNTIES, SERVICE_REGION_NAME } from "@/lib/data/serviceArea";
import { RESOURCES } from "@/lib/data/resources";

const IMPACT_METRICS = [
  { label: "Cases assisted", value: "1,284" },
  { label: "Evictions prevented", value: "412" },
  { label: "Connected to legal aid", value: "538" },
  { label: "Resources matched", value: "6,930" },
  { label: "Recovery plans created", value: "297" },
];

const STEPS = [
  {
    icon: ClipboardList,
    title: "Answer a few questions",
    body: "One question at a time, in plain language. About 3 minutes. No account, no SSN.",
  },
  {
    icon: Route,
    title: "Get your personal plan",
    body: "We figure out where your case stands and what matters most — today, before court, and this week.",
  },
  {
    icon: HandCoins,
    title: "Take action with local help",
    body: "Matched Metro Atlanta programs, a payment plan you can keep, and a message to your landlord.",
  },
  {
    icon: Compass,
    title: "Never hit a dead end",
    body: "If staying stops being realistic, your plan shifts to a safe move and a strong recovery.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-canvas">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sage-100/70 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-32 top-40 h-80 w-80 rounded-full bg-brand-100/70 blur-3xl" aria-hidden />
        <div className="container-page relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr]">
          <div className="animate-fade-up">
            <Badge tone="green" icon={<MapPin className="h-3.5 w-3.5" />}>
              Free for {SERVICE_REGION_NAME} renters
            </Badge>
            <h1 className="mt-5 text-balance text-[1.7rem] font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              Facing eviction can be overwhelming.{" "}
              <span className="text-brand-700">
                HomePath helps you understand your situation, find local help, and build a plan for what comes next.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              Whatever stage you&apos;re in, we answer one question: <strong className="text-ink">what can I still do next?</strong>
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/intake" size="lg">
                Build My Action Plan <ArrowRight className="h-5 w-5" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/resources" size="lg" variant="outline">
                <Search className="h-5 w-5" aria-hidden /> Find Local Resources
              </ButtonLink>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-sage-600" aria-hidden /> No account needed
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-sage-600" aria-hidden /> No SSN or bank info
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-sage-600" aria-hidden /> About 3 minutes
              </li>
            </ul>
          </div>

          {/* Plan preview */}
          <div className="animate-fade-up [animation-delay:150ms]">
            <Card className="relative shadow-lift">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink-muted">Example plan</p>
                <Badge tone="coral">Legal help recommended</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-3 text-center">
                <div>
                  <p className="text-xs text-ink-muted">Owed</p>
                  <p className="text-lg font-semibold">$1,400</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Have today</p>
                  <p className="text-lg font-semibold">$500</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Court in</p>
                  <p className="flex items-center justify-center gap-1 text-lg font-semibold text-coral-600">
                    <CalendarClock className="h-4 w-4" aria-hidden />7 days
                  </p>
                </div>
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Today</p>
              <ul className="mt-2 space-y-2.5">
                {[
                  { icon: Scale, text: "Call Atlanta Legal Aid — court is in 7 days" },
                  { icon: HandCoins, text: "Apply for Fulton County rental assistance" },
                  { icon: HeartHandshake, text: "Send your landlord a payment plan" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
                    <span className="text-sm font-medium">{text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-sage-50 p-3 text-sm text-sage-800">
                <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
                Paycheck + assistance could close the $450 gap
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16" aria-labelledby="how-heading">
        <div className="max-w-2xl">
          <h2 id="how-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            How HomePath works
          </h2>
          <p className="mt-2 text-ink-soft">
            If staying is possible, we help you stay. If it isn&apos;t, we help you reduce the damage and land somewhere stable.
          </p>
        </div>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Card className="h-full">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <s.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold text-ink-muted">Step {i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{s.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Impact */}
      <section className="bg-white py-16" aria-labelledby="impact-heading">
        <div className="container-page">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="impact-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Impact
            </h2>
            <DemoBadge label="Demo data — illustrative numbers" />
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
            {IMPACT_METRICS.map((m) => (
              <div key={m.label} className="rounded-2xl border border-slate-200 bg-canvas p-5">
                <dt className="text-sm text-ink-muted">{m.label}</dt>
                <dd className="mt-1 text-3xl font-bold tracking-tight text-brand-700">{m.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-ink-muted">These figures are simulated for demonstration and do not represent real outcomes.</p>
        </div>
      </section>

      {/* Service area */}
      <section className="container-page py-16" aria-labelledby="area-heading">
        <Card className="grid gap-8 bg-gradient-to-br from-white to-sage-50 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <Badge tone="green" icon={<MapPin className="h-3.5 w-3.5" />}>
              Service area
            </Badge>
            <h2 id="area-heading" className="mt-3 text-2xl font-bold tracking-tight">
              Built for {SERVICE_REGION_NAME}
            </h2>
            <p className="mt-2 text-ink-soft">
              HomePath currently covers {SERVICE_COUNTIES.length} counties with {RESOURCES.length} local programs — legal aid, rental and
              utility assistance, shelter, housing, jobs, and family support.
            </p>
            <ButtonLink href="/intake" className="mt-5">
              Check my county <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SERVICE_COUNTIES.map((c) => (
              <li key={c.name} className="rounded-xl border border-sage-200 bg-white px-4 py-3 text-center font-semibold text-sage-800 shadow-sm">
                {c.name} County
              </li>
            ))}
            <li className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-center text-sm text-ink-muted">More coming soon</li>
          </ul>
        </Card>
      </section>
    </>
  );
}

"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function NotFound() {
  const { tr } = useI18n();
  return (
    <div className="container-page py-16">
      <Card className="mx-auto max-w-lg text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Compass className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-xl font-bold">{tr("We couldn't find that page")}</h1>
        <p className="mt-2 text-ink-soft">{tr("But there's still a path forward. Pick up where you left off:")}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/dashboard">{tr("My plan")}</ButtonLink>
          <ButtonLink href="/resources" variant="outline">
            {tr("Find resources")}</ButtonLink>
        </div>
      </Card>
    </div>
  );
}

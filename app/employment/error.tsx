"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import { ErrorFallback } from "@/components/layout/ErrorFallback";

export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { tr } = useI18n();
  return <ErrorFallback error={error} reset={reset} title={tr("This page couldn't load")} />;
}

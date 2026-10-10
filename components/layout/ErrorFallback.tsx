"use client";

import { useEffect } from "react";
import { LifeBuoy, Phone, RotateCcw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/** Shared error-boundary UI. Never a dead end: always offers 2-1-1 and a way back. */
export function ErrorFallback({ error, reset, title = "Something went wrong" }: { error: Error & { digest?: string }; reset: () => void; title?: string }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page py-16">
      <Card className="mx-auto max-w-lg text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <LifeBuoy className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-xl font-bold">{title}</h1>
        <p className="mt-2 text-ink-soft">This page had a problem loading. Your saved plan is still in this browser.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Try again
          </Button>
          <ButtonLink href="/" variant="outline">
            Go home
          </ButtonLink>
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-muted">
          <Phone className="h-4 w-4" aria-hidden /> Need help now?{" "}
          <a href="tel:211" className="font-semibold text-brand-700 underline">
            Call 2-1-1
          </a>
        </p>
      </Card>
    </div>
  );
}

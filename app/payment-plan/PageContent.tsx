"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import { PaymentPlanClient } from "./PaymentPlanClient";



export default function PaymentPlanPage() {
  const { tr } = useI18n();
  return (
    <div className="container-page max-w-3xl py-8 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tr("Payment plan calculator")}</h1>
      <p className="mb-6 mt-1 text-ink-soft">{tr("Build a realistic catch-up plan around your paychecks, then draft a respectful message to your landlord.")}</p>
      <PaymentPlanClient />
    </div>
  );
}

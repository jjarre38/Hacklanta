import type { Metadata } from "next";
import { PaymentPlanClient } from "./PaymentPlanClient";

export const metadata: Metadata = { title: "Payment plan calculator" };

export default function PaymentPlanPage() {
  return (
    <div className="container-page max-w-3xl py-8 sm:py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Payment plan calculator</h1>
      <p className="mb-6 mt-1 text-ink-soft">Build a realistic catch-up plan around your paychecks, then draft a respectful message to your landlord.</p>
      <PaymentPlanClient />
    </div>
  );
}

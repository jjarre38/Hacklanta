"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import Link from "next/link";
import { useFormContext } from "react-hook-form";
import { useRef } from "react";
import { MapPinOff, Phone } from "lucide-react";
import type { IntakeValues } from "@/lib/intake/schema";
import { EMPLOYMENT_OPTIONS, STAGE_OPTIONS } from "@/lib/intake/schema";
import { countyForZip, SERVICE_COUNTIES, SERVICE_REGION_NAME } from "@/lib/data/serviceArea";
import { showAssistanceStatus, showCourtDate, showPaymentPlanDiscussed, showPaymentPlanRejected } from "@/lib/intake/steps";
import { ChoiceGroup, DateInput, FieldError, MoneyInput, NumberInput, Question, YesNo } from "./fields";

export const OUT_OF_AREA = "OTHER";

// ------------------------------------------------------------------ Location
export function LocationStep() {
  const { tr } = useI18n();
  const { register, watch, setValue } = useFormContext<IntakeValues>();
  const county = watch("county");
  const zip = watch("zipCode");
  const autoSet = useRef(false);
  const zipMatch = zip && /^\d{5}$/.test(zip) ? countyForZip(zip) : null;

  return (
    <div className="space-y-7">
      <Question label={tr("What's your ZIP code?")} htmlFor="zipCode">
        <input
          id="zipCode"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          placeholder={tr("e.g. 30310")}
          className="field-input max-w-[10rem] text-lg tracking-wider"
          {...register("zipCode", {
            onChange: (e) => {
              const v = String(e.target.value);
              const match = /^\d{5}$/.test(v) ? countyForZip(v) : null;
              if (match && (!county || autoSet.current)) {
                setValue("county", match, { shouldValidate: true });
                autoSet.current = true;
              }
            },
          })}
        />
        <FieldError name="zipCode" />
        {zip?.length === 5 && !zipMatch && !county && (
          <p className="mt-2 text-sm text-ink-muted">{tr("We couldn't match this ZIP automatically — please choose your county below.")}</p>
        )}
      </Question>

      <Question label={tr("Which county do you live in?")} hint={zipMatch ? tr("Based on your ZIP, it looks like {0} County. Change it if that's not right.", { 0: zipMatch }) : undefined} htmlFor="county">
        <select
          id="county"
          className="field-input max-w-xs"
          {...register("county", { onChange: () => (autoSet.current = false) })}
        >
          <option value="">{tr("Choose your county")}</option>
          {SERVICE_COUNTIES.map((c) => (
            <option key={c.name} value={c.name}>
              {tr("{0} County", { 0: c.name })}</option>
          ))}
          <option value={OUT_OF_AREA}>{tr("Another county")}</option>
        </select>
        {county !== OUT_OF_AREA && <FieldError name="county" />}
      </Question>

      {county === OUT_OF_AREA && <OutOfAreaNotice />}
    </div>
  );
}

function OutOfAreaNotice() {
  const { text, tr } = useI18n();
  return (
    <div className="animate-fade-up rounded-2xl border border-amber-200 bg-amber-50 p-5" role="status">
      <div className="flex gap-3">
        <MapPinOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
        <div>
          <p className="font-semibold text-amber-900">{tr("HomePath doesn't cover your county yet — but you still have options.")}</p>
          <p className="mt-1 text-sm text-amber-900/90">
            {tr("We currently build plans for ")}{text(SERVICE_REGION_NAME)} ({SERVICE_COUNTIES.map((c) => c.name).join(", ")}{tr("). Here's where to get help today:")}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-amber-700" aria-hidden />
              <span>
                <a href="tel:211" className="font-semibold underline">
                  {tr("Call 2-1-1")}</a>{" "}
                {tr("— free, 24/7 help finding rent, utility, and food assistance anywhere in Georgia.")}</span>
            </li>
            <li>
              <a href="https://www.georgialegalaid.org" target="_blank" rel="noreferrer" className="font-semibold underline">
                GeorgiaLegalAid.org
              </a>{" "}
              {tr("— free eviction guides and how to find legal aid statewide.")}</li>
            <li>
              <Link href="/rights" className="font-semibold underline">
                {tr("Know your rights in Georgia")}</Link>{" "}
              {tr("— general information that applies statewide.")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------- Financial
export function FinancialStep({ screen }: { screen: "rent" | "money" }) {
  const { tr } = useI18n();
  if (screen === "rent") {
    return (
      <div className="space-y-7">
        <MoneyInput name="monthlyRent" label={tr("How much is your monthly rent?")} placeholder="1250" />
        <MoneyInput name="amountOwed" label={tr("About how much do you owe right now?")} hint={tr("Include late fees if you know them.")} placeholder="1400" />
      </div>
    );
  }
  return (
    <div className="space-y-7">
      <MoneyInput name="availableToday" label={tr("How much could you put toward rent today?")} hint={tr("It's okay if this is $0.")} />
      <MoneyInput name="monthlyIncome" label={tr("About how much does your household bring in each month?")} hint={tr("After taxes. Include benefits.")} />
      <MoneyInput name="nextPaycheckAmount" label={tr("How much is your next paycheck? (optional)")} />
      <DateInput name="nextPaycheckDate" label={tr("When is your next payday? (optional)")} />
    </div>
  );
}

// ----------------------------------------------------------------- Household
export function HouseholdStep({ screen }: { screen: "household" | "work" }) {
  const { tr } = useI18n();
  if (screen === "household") {
    return (
      <div className="space-y-7">
        <NumberInput name="householdSize" label={tr("How many people live in your home, including you?")} />
        <YesNo name="hasChildren" label={tr("Are there children under 18 in your home?")} />
      </div>
    );
  }
  return (
    <div className="space-y-7">
      <ChoiceGroup name="employmentStatus" label={tr("Which best describes your work right now?")} options={EMPLOYMENT_OPTIONS} columns={2} />
      <YesNo name="incomeRecentlyReduced" label={tr("Has your income dropped recently?")} hint={tr("Fewer hours, job loss, a medical issue, or lost benefits.")} />
    </div>
  );
}

// ------------------------------------------------------------------ Landlord
export function LandlordStep() {
  const { tr } = useI18n();
  const { watch, setValue, register } = useFormContext<IntakeValues>();
  const values = watch();
  return (
    <div className="space-y-7">
      <YesNo
        name="contactedLandlord"
        label={tr("Have you talked with your landlord or property manager about the rent you owe?")}
        onChange={(v) => {
          if (!v) {
            setValue("paymentPlanDiscussed", false);
            setValue("paymentPlanRejected", false);
          }
        }}
      />
      {showPaymentPlanDiscussed(values) && (
        <YesNo
          name="paymentPlanDiscussed"
          label={tr("Did you discuss a payment plan?")}
          onChange={(v) => {
            if (!v) setValue("paymentPlanRejected", false);
          }}
        />
      )}
      {showPaymentPlanRejected(values) && <YesNo name="paymentPlanRejected" label={tr("Did your landlord say no to the payment plan?")} />}
      <YesNo
        name="canAffordPaymentPlan"
        label={
          values.paymentPlanDiscussed
            ? tr("Could you afford the payment plan you discussed?")
            : tr("Could you pay a little extra each month, on top of rent, to catch up?")
        }
      />
      <Question label={tr("Landlord or property name (optional)")} hint={tr("Used only to personalize a draft message.")} htmlFor="landlordName">
        <input id="landlordName" className="field-input max-w-md" autoComplete="off" {...register("landlordName")} />
      </Question>
    </div>
  );
}

// ---------------------------------------------------------------- Assistance
export function AssistanceStep() {
  const { tr } = useI18n();
  const { watch, setValue } = useFormContext<IntakeValues>();
  const values = watch();
  return (
    <div className="space-y-7">
      <YesNo
        name="appliedForAssistance"
        label={tr("Have you applied for rental assistance?")}
        onChange={(v) => {
          if (!v) setValue("assistanceStatus", undefined);
        }}
      />
      {showAssistanceStatus(values) && (
        <ChoiceGroup
          name="assistanceStatus"
          label={tr("What happened with your application?")}
          options={[
            { value: "WAITLISTED", label: tr("Still waiting / waitlisted") },
            { value: "APPROVED", label: tr("Approved") },
            { value: "DENIED", label: tr("Denied, or funds ran out") },
          ]}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------ Eviction stage
export function EvictionStageStep() {
  const { tr } = useI18n();
  const { watch, setValue } = useFormContext<IntakeValues>();
  const values = watch();
  return (
    <div className="space-y-7">
      <ChoiceGroup
        name="evictionStage"
        label={tr("Which is closest to your situation?")}
        options={STAGE_OPTIONS}
        onChange={(v) => {
          if (v !== "COURT_DATE_SCHEDULED") setValue("courtDate", undefined);
        }}
      />
      {showCourtDate(values) && (
        <DateInput name="courtDate" label={tr("When is your court date?")} hint={tr("It's on your court papers. If you're unsure, give your best estimate and update it later.")} />
      )}
    </div>
  );
}

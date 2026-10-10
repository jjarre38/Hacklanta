"use client";

import clsx from "clsx";
import { Check } from "lucide-react";
import { Controller, useFormContext, type FieldPath } from "react-hook-form";
import type { ReactNode } from "react";
import type { IntakeValues } from "@/lib/intake/schema";

type Name = FieldPath<IntakeValues>;

export function FieldError({ name }: { name: Name }) {
  const {
    formState: { errors },
  } = useFormContext<IntakeValues>();
  const err = errors[name as keyof IntakeValues];
  if (!err?.message) return null;
  return (
    <p className="field-error" role="alert">
      {String(err.message)}
    </p>
  );
}

export function Question({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="animate-fade-up">
      <label htmlFor={htmlFor} className="block text-base font-semibold text-ink">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-sm text-ink-muted">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

const toNumber = (v: unknown) => (v === "" || v === null || v === undefined ? undefined : Number(v));

export function MoneyInput({ name, label, hint, placeholder }: { name: Name; label: string; hint?: string; placeholder?: string }) {
  const { register } = useFormContext<IntakeValues>();
  return (
    <Question label={label} hint={hint} htmlFor={name}>
      <div className="relative max-w-xs">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-ink-muted">$</span>
        <input
          id={name}
          type="number"
          inputMode="decimal"
          min={0}
          step="1"
          placeholder={placeholder ?? "0"}
          className="field-input pl-8"
          {...register(name, { setValueAs: toNumber })}
        />
      </div>
      <FieldError name={name} />
    </Question>
  );
}

export function NumberInput({ name, label, hint }: { name: Name; label: string; hint?: string }) {
  const { register } = useFormContext<IntakeValues>();
  return (
    <Question label={label} hint={hint} htmlFor={name}>
      <input
        id={name}
        type="number"
        inputMode="numeric"
        min={1}
        step="1"
        className="field-input max-w-[8rem]"
        {...register(name, { setValueAs: toNumber })}
      />
      <FieldError name={name} />
    </Question>
  );
}

export function DateInput({ name, label, hint }: { name: Name; label: string; hint?: string }) {
  const { register } = useFormContext<IntakeValues>();
  return (
    <Question label={label} hint={hint} htmlFor={name}>
      <input
        id={name}
        type="date"
        className="field-input max-w-xs"
        {...register(name, { setValueAs: (v) => (v === "" ? undefined : v) })}
      />
      <FieldError name={name} />
    </Question>
  );
}

interface Option<T extends string | boolean> {
  value: T;
  label: string;
  hint?: string;
}

/** Large tap-target radio cards controlled by react-hook-form. */
export function ChoiceGroup<T extends string | boolean>({
  name,
  label,
  hint,
  options,
  columns = 1,
  onChange,
}: {
  name: Name;
  label: string;
  hint?: string;
  options: Option<T>[];
  columns?: 1 | 2;
  onChange?: (value: T) => void;
}) {
  const { control } = useFormContext<IntakeValues>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <fieldset className="animate-fade-up">
          <legend className="text-base font-semibold text-ink">{label}</legend>
          {hint && <p className="mt-0.5 text-sm text-ink-muted">{hint}</p>}
          <div className={clsx("mt-3 grid gap-2.5", columns === 2 && "sm:grid-cols-2")} role="radiogroup">
            {options.map((o) => {
              const selected = field.value === o.value;
              return (
                <button
                  key={String(o.value)}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    field.onChange(o.value);
                    onChange?.(o.value);
                  }}
                  className={clsx(
                    "flex min-h-[52px] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                    selected ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-slate-300 bg-white hover:border-brand-300 hover:bg-slate-50",
                  )}
                >
                  <span>
                    <span className="block font-medium text-ink">{o.label}</span>
                    {o.hint && <span className="mt-0.5 block text-sm text-ink-muted">{o.hint}</span>}
                  </span>
                  <span
                    className={clsx(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                      selected ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300",
                    )}
                  >
                    {selected && <Check className="h-4 w-4" aria-hidden />}
                  </span>
                </button>
              );
            })}
          </div>
          <FieldError name={name} />
        </fieldset>
      )}
    />
  );
}

export function YesNo({ name, label, hint, onChange }: { name: Name; label: string; hint?: string; onChange?: (v: boolean) => void }) {
  return (
    <ChoiceGroup<boolean>
      name={name}
      label={label}
      hint={hint}
      columns={2}
      onChange={onChange}
      options={[
        { value: true, label: "Yes" },
        { value: false, label: "No" },
      ]}
    />
  );
}

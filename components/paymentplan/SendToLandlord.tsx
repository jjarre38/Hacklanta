"use client";

import { useState } from "react";
import clsx from "clsx";
import { Mail, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Method = "email" | "text";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Keep a leading + for international numbers, drop everything else that isn't a digit. */
function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  return (trimmed.startsWith("+") ? "+" : "") + trimmed.replace(/\D/g, "");
}

/**
 * Opens the tenant's own email or messaging app with the draft pre-filled, so the message
 * comes from their address/number and they keep a copy in their sent folder.
 */
export function SendToLandlord({ subject, message }: { subject: string; message: string }) {
  const [method, setMethod] = useState<Method>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const phoneDigits = normalizePhone(phone);
  const valid = method === "email" ? EMAIL_RE.test(email.trim()) : phoneDigits.replace("+", "").length >= 10;
  const empty = !message.trim();

  function send() {
    if (!valid || empty) return;
    const href =
      method === "email"
        ? `mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
        : `sms:${phoneDigits}?body=${encodeURIComponent(subject ? `${subject}\n\n${message}` : message)}`;
    window.location.href = href;
  }

  return (
    <div className="mt-5 border-t border-brand-100 pt-4">
      <p className="text-sm font-semibold text-ink">Send to your landlord</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:max-w-xs" role="radiogroup" aria-label="Send by">
        {(
          [
            { id: "email", label: "Email", icon: Mail },
            { id: "text", label: "Text message", icon: MessageCircle },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={method === id}
            onClick={() => setMethod(id)}
            className={clsx(
              "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium",
              method === id ? "border-brand-500 bg-brand-50 text-brand-800 ring-1 ring-brand-500" : "border-slate-300 bg-white",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden /> {label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          {method === "email" ? (
            <>
              <label htmlFor="landlord-email" className="field-label">
                Landlord&apos;s email
              </label>
              <input
                id="landlord-email"
                type="email"
                inputMode="email"
                autoComplete="off"
                className="field-input"
                placeholder="landlord@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </>
          ) : (
            <>
              <label htmlFor="landlord-phone" className="field-label">
                Landlord&apos;s mobile number
              </label>
              <input
                id="landlord-phone"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                className="field-input"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </>
          )}
        </div>
        <Button onClick={send} disabled={!valid || empty}>
          <Send className="h-4 w-4" aria-hidden />
          {method === "email" ? "Open in email" : "Open in messages"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-ink-muted">
        {method === "email"
          ? "This opens your email app with the message filled in. It's sent from your own account, so you'll keep a copy."
          : "This opens your phone's messaging app with the message filled in. Works best on a phone."}{" "}
        Nothing is sent until you press send there.
      </p>
    </div>
  );
}

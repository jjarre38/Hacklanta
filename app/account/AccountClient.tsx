"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { AlertCircle, CheckCircle2, CloudOff, Eye, EyeOff, Loader2, Lock, LogOut, Sparkles, UserRound } from "lucide-react";
import { signIn, signInDemo, signOut, signUp, useAccount } from "@/lib/client/account";
import { clearCase, useCase } from "@/lib/client/caseStore";
import { DEMO_ACCOUNT } from "@/lib/demo/demoAccount";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Mode = "sign-in" | "sign-up";

export function AccountClient() {
  const { tr } = useI18n();
  const router = useRouter();
  const account = useAccount();
  const { userCase } = useCase();
  const [justSignedIn, setJustSignedIn] = useState(false);
  const fromPlan = useSearchParams().get("reason") === "plan";

  // After signing in, wait until the account's saved plan has loaded, then go to it.
  // Accounts without a plan go straight to the questionnaire.
  useEffect(() => {
    if (justSignedIn && account.status === "signed-in" && account.caseReady) router.push(userCase ? "/dashboard" : "/intake");
  }, [justSignedIn, account.status, account.caseReady, userCase, router]);

  return (
    <div className="container-page max-w-lg py-8 sm:py-12">
      {account.status === "loading" && (
        <div className="flex items-center justify-center gap-2 py-16 text-ink-muted" aria-busy="true">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> {tr(" Checking your account…")}</div>
      )}
      {account.status === "unconfigured" && <NotConfigured />}
      {account.status === "signed-out" && <SignInForm fromPlan={fromPlan} onSignedIn={() => setJustSignedIn(true)} />}
      {account.status === "signed-in" && (justSignedIn ? <Redirecting /> : <SignedIn />)}
    </div>
  );
}

function Redirecting() {
  const { tr } = useI18n();
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-ink-muted" aria-busy="true">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> {tr(" Loading your plan…")}</div>
  );
}

function SignInForm({ fromPlan, onSignedIn }: { fromPlan: boolean; onSignedIn: () => void }) {
  const { text, tr } = useI18n();
  const hasLocalPlan = Boolean(useCase().userCase);
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<"form" | "demo" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy("form");
    setError(null);
    setNotice(null);
    if (mode === "sign-in") {
      const result = await signIn(email, password);
      if (result.error) setError(result.error);
      else onSignedIn();
    } else {
      const result = await signUp(email, password);
      if (result.error) setError(result.error);
      else if (result.needsConfirmation) setNotice("Check your email for a link to confirm your account, then sign in.");
      else onSignedIn();
    }
    setBusy(null);
  }

  async function useDemo() {
    setBusy("demo");
    setError(null);
    setNotice(null);
    const result = await signInDemo();
    if (result.error) setError(result.error);
    else onSignedIn();
    setBusy(null);
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{mode === "sign-in" ? tr("Sign in") : tr("Create an account")}</h1>
      <p className="mt-1 text-ink-soft">
        {tr("Your plan is saved to your account so you can come back to it on any device. Resources and Know Your Rights stay open to everyone.")}</p>
      {fromPlan && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-900" role="status">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            {tr("Sign in or create an account to see your plan.")}{hasLocalPlan && tr(" The answers you just gave will be saved to your new account.")}
          </span>
        </p>
      )}

      <Card className="mt-6">
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label={tr("Account")}>
          {(["sign-in", "sign-up"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
                setError(null);
                setNotice(null);
              }}
              className={clsx(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                mode === m ? "bg-white text-brand-700 shadow-sm" : "text-ink-muted hover:text-ink",
              )}
            >
              {m === "sign-in" ? tr("Sign in") : tr("Create account")}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="account-email" className="field-label">
              {tr("Email")}</label>
            <input
              id="account-email"
              type="email"
              autoComplete="email"
              required
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="account-password" className="field-label">
              {tr("Password")}</label>
            <div className="relative">
              <input
                id="account-password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                required
                minLength={8}
                className="field-input pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? tr("Hide password") : tr("Show password")}
                aria-pressed={showPassword}
                aria-controls="account-password"
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-ink-muted hover:text-ink"
              >
                {showPassword ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
              </button>
            </div>
            {mode === "sign-up" && <p className="mt-1 text-xs text-ink-muted">{tr("At least 8 characters.")}</p>}
          </div>
          {error && (
            <p className="flex items-start gap-2 rounded-xl bg-coral-50 p-3 text-sm text-coral-700" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {text(error)}
            </p>
          )}
          {notice && (
            <p className="flex items-start gap-2 rounded-xl bg-sage-50 p-3 text-sm text-sage-700" role="status">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {text(notice)}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={busy !== null}>
            {busy === "form" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {mode === "sign-in" ? tr("Sign in") : tr("Create account")}
          </Button>
        </form>
        <p className="mt-4 text-xs text-ink-muted">
          {mode === "sign-in"
            ? tr("Signing in loads the plan saved to your account.")
            : tr("If you've already started a plan in this browser, it will be saved to your new account.")}
        </p>
      </Card>

      <div className="mt-5 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/70 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
          <Sparkles className="h-4 w-4 text-amber-700" aria-hidden /> {tr(" Demo account")}</p>
        <p className="mt-1 text-sm text-amber-900/80">
          {tr("Sign in as Maria, our fictional demo tenant: ")}<span className="font-mono">{DEMO_ACCOUNT.email}</span> /{" "}
          <span className="font-mono">{DEMO_ACCOUNT.password}</span>{tr(". Anyone can use it, so don't enter real information.")}</p>
        <Button variant="outline" size="sm" className="mt-3 border-amber-300" onClick={useDemo} disabled={busy !== null}>
          {busy === "demo" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {tr("Use the demo account")}</Button>
      </div>
    </>
  );
}

function SignedIn() {
  const { text, tr } = useI18n();
  const account = useAccount();
  const { userCase } = useCase();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tr("Your account")}</h1>
      <Card className="mt-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <UserRound className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-ink-muted">{tr("Signed in as")}</p>
            <p className="truncate font-semibold">{account.email}</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-3 text-sm" role="status">
          {account.sync === "syncing" && (
            <p className="flex items-center gap-2 text-ink-soft">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {tr(" Saving…")}</p>
          )}
          {account.sync === "saved" && (
            <p className="flex items-center gap-2 text-sage-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden /> {tr(" Your plan is saved to your account.")}</p>
          )}
          {account.sync === "idle" && <p className="text-ink-soft">{tr("No plan saved yet. Build one and it will be saved here automatically.")}</p>}
          {account.sync === "error" && (
            <p className="flex items-start gap-2 text-coral-700">
              <CloudOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {text(account.syncError)}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <ButtonLink href={userCase ? "/dashboard" : "/intake"} className="flex-1">
            {userCase ? tr("Go to my plan") : tr("Build my plan")}
          </ButtonLink>
          <Button
            variant="outline"
            className="flex-1"
            disabled={signingOut}
            onClick={async () => {
              setSigningOut(true);
              await signOut();
            }}
          >
            {signingOut ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="h-4 w-4" aria-hidden />}
            {tr("Sign out")}</Button>
        </div>
        <p className="mt-3 text-xs text-ink-muted">{tr("Signing out removes your plan from this browser. It stays saved in your account.")}</p>
      </Card>

      {userCase && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          {confirmDelete ? (
            <>
              <p className="font-semibold">{tr("Delete your saved plan?")}</p>
              <p className="mt-1 text-ink-soft">{tr("This removes it from your account and this browser. It can't be undone.")}</p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="bg-coral-600 hover:bg-coral-700"
                  onClick={() => {
                    clearCase();
                    setConfirmDelete(false);
                  }}
                >
                  {tr("Delete plan")}</Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                  {tr("Cancel")}</Button>
              </div>
            </>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="font-semibold text-coral-700 hover:underline">
              {tr("Delete my saved plan")}</button>
          )}
        </div>
      )}
    </>
  );
}

function NotConfigured() {
  const { tr } = useI18n();
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tr("Accounts")}</h1>
      <Card className="mt-6">
        <p className="font-semibold">{tr("Accounts aren't set up on this site yet.")}</p>
        <p className="mt-1 text-sm text-ink-soft">
          {tr("You can still use HomePath — your plan is saved in this browser. To turn on accounts, add the Supabase keys to the server environment and follow the “Accounts” steps in the README.")}</p>
        <ButtonLink href="/dashboard" variant="outline" className="mt-4">
          {tr("Continue without an account")}</ButtonLink>
      </Card>
    </>
  );
}

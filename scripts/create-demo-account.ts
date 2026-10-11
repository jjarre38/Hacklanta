// Creates the shared demo account (or resets it) with Maria's fictional case.
// Run: npm run db:demo-account   (needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local,
// and supabase/accounts.sql applied). Safe to re-run: it resets the password and Maria's case.
import { createClient } from "@supabase/supabase-js";
import { DEMO_ACCOUNT } from "../lib/demo/demoAccount";
import { mariaIntake } from "../lib/demo/mariaSeed";
import { createCaseFromIntake } from "../lib/services/caseService";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function findUserId(email: string): Promise<string | null> {
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < 1000) return null;
  }
}

async function main() {
  let userId = await findUserId(DEMO_ACCOUNT.email);
  if (userId) {
    const { error } = await admin.auth.admin.updateUserById(userId, { password: DEMO_ACCOUNT.password, email_confirm: true });
    if (error) throw error;
    console.log(`Demo account exists; password reset (${DEMO_ACCOUNT.email}).`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({ email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password, email_confirm: true });
    if (error) throw error;
    userId = data.user.id;
    console.log(`Created demo account ${DEMO_ACCOUNT.email}.`);
  }

  const { error } = await admin
    .from("account_cases")
    .upsert({ user_id: userId, data: createCaseFromIntake(mariaIntake()), updated_at: new Date().toISOString() });
  if (error) {
    if (/account_cases/.test(error.message)) console.error("The account_cases table is missing — run supabase/accounts.sql in the Supabase SQL editor first.");
    throw error;
  }
  console.log("Loaded Maria's demo case. Sign in at /account with the demo credentials.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

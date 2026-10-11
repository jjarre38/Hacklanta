import type { Metadata } from "next";
import { AccountClient } from "./AccountClient";

export const metadata: Metadata = { title: "Your account" };

export default function AccountPage() {
  return <AccountClient />;
}

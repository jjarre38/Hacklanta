import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountClient } from "./AccountClient";

export const metadata: Metadata = { title: "Your account" };

export default function AccountPage() {
  // AccountClient reads the query string, which Next requires inside a Suspense boundary.
  return (
    <Suspense>
      <AccountClient />
    </Suspense>
  );
}

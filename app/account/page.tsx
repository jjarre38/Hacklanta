import { pageMetadata } from "@/lib/i18n/server";
import { Suspense } from "react";
import { AccountClient } from "./AccountClient";

export function generateMetadata() { return pageMetadata("Your account"); }

export default function AccountPage() {
  // AccountClient reads the query string, which Next requires inside a Suspense boundary.
  return (
    <Suspense>
      <AccountClient />
    </Suspense>
  );
}

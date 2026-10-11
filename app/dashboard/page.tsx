import { pageMetadata } from "@/lib/i18n/server";
import { DashboardClient } from "./DashboardClient";

export function generateMetadata() { return pageMetadata("My plan"); }

export default function DashboardPage() {
  return <DashboardClient />;
}

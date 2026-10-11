import { pageMetadata } from "@/lib/i18n/server";
import { EmploymentClient } from "./EmploymentClient";

export function generateMetadata() { return pageMetadata("Employment recovery"); }

export default function EmploymentPage() {
  return <EmploymentClient />;
}

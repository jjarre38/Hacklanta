import { pageMetadata } from "@/lib/i18n/server";
import { HousingClient } from "./HousingClient";

export function generateMetadata() { return pageMetadata("Affordable housing"); }

export default function HousingPage() {
  return <HousingClient />;
}

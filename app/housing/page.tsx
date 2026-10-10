import type { Metadata } from "next";
import { HousingClient } from "./HousingClient";

export const metadata: Metadata = { title: "Affordable housing" };

export default function HousingPage() {
  return <HousingClient />;
}

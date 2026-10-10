import type { Metadata } from "next";
import { EmploymentClient } from "./EmploymentClient";

export const metadata: Metadata = { title: "Employment recovery" };

export default function EmploymentPage() {
  return <EmploymentClient />;
}

import type { Metadata } from "next";
import { IntakeWizard } from "@/components/intake/IntakeWizard";

export const metadata: Metadata = { title: "Build my action plan" };

export default function IntakePage() {
  return (
    <div className="bg-gradient-to-b from-brand-50/60 to-canvas py-8 sm:py-12">
      <div className="container-page">
        <IntakeWizard />
      </div>
    </div>
  );
}

import { pageMetadata } from "@/lib/i18n/server";
import { IntakeWizard } from "@/components/intake/IntakeWizard";

export function generateMetadata() { return pageMetadata("Build my action plan"); }

export default function IntakePage() {
  return (
    <div className="bg-gradient-to-b from-brand-50/60 to-canvas py-8 sm:py-12">
      <div className="container-page">
        <IntakeWizard />
      </div>
    </div>
  );
}

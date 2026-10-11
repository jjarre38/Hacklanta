import { pageMetadata } from "@/lib/i18n/server";
import { Suspense } from "react";
import { ResourcesClient } from "./ResourcesClient";
import { ResourceListSkeleton } from "@/components/resources/ResourceListSkeleton";

export function generateMetadata() { return pageMetadata("Local resources"); }

export default function ResourcesPage() {
  return (
    <Suspense fallback={<ResourceListSkeleton />}>
      <ResourcesClient />
    </Suspense>
  );
}

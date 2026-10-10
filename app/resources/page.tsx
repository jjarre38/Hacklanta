import type { Metadata } from "next";
import { Suspense } from "react";
import { ResourcesClient } from "./ResourcesClient";
import { ResourceListSkeleton } from "@/components/resources/ResourceListSkeleton";

export const metadata: Metadata = { title: "Local resources" };

export default function ResourcesPage() {
  return (
    <Suspense fallback={<ResourceListSkeleton />}>
      <ResourcesClient />
    </Suspense>
  );
}

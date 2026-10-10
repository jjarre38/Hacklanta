"use client";

import { useEffect, useState } from "react";
import type { Resource } from "@/types";
import { RESOURCES } from "@/lib/data/resources";

/**
 * Resource list for client components. Starts with the bundled static dataset
 * (so there's never an empty state) and swaps in the API result, which comes
 * from Supabase when it's configured.
 */
export function useResources() {
  const [resources, setResources] = useState<Resource[]>(RESOURCES);
  const [source, setSource] = useState<"supabase" | "static">("static");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/resources")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.resources?.length) {
          setResources(data.resources);
          setSource(data.source);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return { resources, source };
}

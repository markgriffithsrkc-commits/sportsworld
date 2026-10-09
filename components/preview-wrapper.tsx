"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

const HygraphPreview = dynamic(
  () =>
    import("@hygraph/preview-sdk/react").then((module) => ({
      default: module.HygraphPreview,
    })),
  { ssr: false },
);

export function PreviewWrapper({
  children,
  enabled,
  endpoint,
  studioUrl,
}: {
  children: ReactNode;
  enabled: boolean;
  endpoint?: string;
  studioUrl?: string;
}) {
  const router = useRouter();

  if (!enabled || !endpoint) return children;

  return (
    <HygraphPreview
      endpoint={endpoint}
      studioUrl={studioUrl || undefined}
      onSave={() => router.refresh()}
      sync={{ fieldFocus: true, fieldUpdate: true }}>
      {children}
    </HygraphPreview>
  );
}

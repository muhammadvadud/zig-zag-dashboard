"use client";

import * as Lucide from "lucide-react";
import type { LucideProps } from "lucide-react";

// Resolve a lucide icon by name (used by the sidebar config).
export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = (Lucide as unknown as Record<string, React.ComponentType<LucideProps>>)[
    name
  ];
  const Fallback = Lucide.Circle;
  const C = Cmp || Fallback;
  return <C {...props} />;
}

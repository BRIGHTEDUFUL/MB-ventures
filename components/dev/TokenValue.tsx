"use client";

import { useEffect, useState } from "react";

/**
 * Resolves a CSS custom property (e.g. "--brand") to its computed value.
 * The design-system page reads tokens straight from globals.css so the
 * printed value can never drift from the real token.
 */
export function TokenValue({ name }: { name: string }) {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    setValue(resolved || "unset");
  }, [name]);

  return <span className="text-ink-muted font-mono">{value ?? "…"}</span>;
}

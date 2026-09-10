"use client";

import { useEffect, useRef } from "react";

export function StripScroller({ selectedWeek, children }: { selectedWeek?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!selectedWeek) return; ref.current?.querySelector<HTMLElement>(`[data-week="${selectedWeek}"]`)?.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" }); }, [selectedWeek]);
  return <div ref={ref}>{children}</div>;
}

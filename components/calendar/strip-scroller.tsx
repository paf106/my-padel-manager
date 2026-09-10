"use client";

import { useCallback } from "react";

export function StripScroller({ selectedWeek, children }: { selectedWeek?: string; children: React.ReactNode }) {
  const setNode = useCallback((node: HTMLDivElement | null) => {
    if (!node || !selectedWeek) return;
    const target = node.querySelector<HTMLElement>(`[data-week="${selectedWeek}"]`);
    if (target) node.scrollLeft = target.offsetLeft;
  }, [selectedWeek]);
  return <div ref={setNode}>{children}</div>;
}

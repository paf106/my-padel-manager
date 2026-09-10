"use client";

import { useCallback } from "react";

export function StripScroller({ weekIndex, children }: { weekIndex: number; children: React.ReactNode }) {
  const setNode = useCallback((node: HTMLDivElement | null) => {
    if (!node || weekIndex < 0) return;
    node.scrollLeft = weekIndex * node.clientWidth;
  }, [weekIndex]);
  return <div ref={setNode} className="flex snap-x snap-mandatory overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{children}</div>;
}

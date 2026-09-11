"use client";

import { useRouter } from "next/navigation";
import { MouseEvent, ReactNode } from "react";

export function ClickableRow({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  function handleClick(event: MouseEvent<HTMLTableRowElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("a,button,input,select,textarea")) return;
    router.push(href);
  }
  return (
    <tr onClick={handleClick} className={`cursor-pointer ${className ?? ""}`}>
      {children}
    </tr>
  );
}

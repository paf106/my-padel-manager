import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function Fab({
  href,
  onClick,
  label,
  icon: Icon,
}: {
  href?: string;
  onClick?: () => void;
  label: string;
  icon: LucideIcon;
}) {
  const className =
    "fixed bottom-[calc(var(--bottom-nav-h)+1rem)] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-emerald-900/25 transition hover:bg-primary-hover lg:hidden";
  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={label} className={className}>
        <Icon size={25} />
      </button>
    );
  }
  return (
    <Link href={href ?? "#"} aria-label={label} className={className}>
      <Icon size={25} />
    </Link>
  );
}

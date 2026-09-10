import Link, { type LinkProps } from "next/link";
import { buttonClasses } from "./button";

export function ButtonLink({ className, variant, size, ...props }: LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: "primary" | "secondary" | "danger" | "ghost"; size?: "sm" | "md" }) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}

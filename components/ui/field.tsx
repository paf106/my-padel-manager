import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const control = "mt-2 h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-3";
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={cn(control, className)} {...props} />; }
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={cn("mt-2 min-h-24 w-full rounded-xl border border-slate-300 bg-slate-50 p-3", className)} {...props} />; }
export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select className={cn(control, className)} {...props} />; }
export function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-bold">{label}{children}</label>; }

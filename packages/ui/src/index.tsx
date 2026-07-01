import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("rounded-xl bg-sky-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-sky-300", className)} {...props} />;
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-sky-950/20", className)} {...props} />;
}

export const designTokens = {
  colors: { background: "#07111f", card: "#0f172a", accent: "#38bdf8" },
  radii: { card: "1rem", control: "0.75rem" }
} as const;

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function Button({ className, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("rounded-xl px-4 py-2 font-semibold transition", className)} style={{ border: "1px solid var(--border)", borderRadius: "0.85rem", background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: "0 10px 22px rgba(161,130,118,.18)", cursor: "pointer", ...style }} {...props} />;
}

export function Card({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border p-6 shadow-2xl", className)} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--card)", color: "var(--card-foreground)", boxShadow: "0 24px 70px rgba(161,130,118,.18)", backdropFilter: "blur(16px)", ...style }} {...props} />;
}

export const designTokens = {
  colors: {
    limeCream: "#cbe896ff",
    ashGrey: "#aac0aaff",
    softPeach: "#fcdfa6ff",
    dustyTaupe: "#a18276ff",
    lightCaramel: "#f4b886ff",
    background: "var(--background)",
    foreground: "var(--foreground)",
    primary: "var(--primary)",
    secondary: "var(--secondary)",
    accent: "var(--accent)",
    muted: "var(--muted)",
    border: "var(--border)",
    card: "var(--card)",
    success: "var(--success)",
    warning: "var(--warning)",
    blockingIssue: "var(--blocking-issue)",
    nonBlockingIssue: "var(--non-blocking-issue)"
  },
  radii: { card: "var(--radius)", control: "0.75rem" }
} as const;

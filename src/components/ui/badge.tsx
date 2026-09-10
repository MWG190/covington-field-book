import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  children,
}: {
  className?: string;
  tone?: "neutral" | "a" | "b" | "c" | "d" | "e" | "r" | "dparty" | "n" | "ok" | "warn";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-paper-2 text-ink-soft",
    a: "bg-dist-a/15 text-dist-a",
    b: "bg-dist-b/15 text-dist-b",
    c: "bg-dist-c/15 text-dist-c",
    d: "bg-dist-d/15 text-dist-d",
    e: "bg-dist-e/15 text-dist-e",
    r: "bg-party-r/12 text-party-r",
    dparty: "bg-party-d/12 text-party-d",
    n: "bg-paper-2 text-muted",
    ok: "bg-ok/12 text-ok",
    warn: "bg-warn/12 text-warn",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function distTone(d: string) {
  const k = d.toLowerCase();
  if (k === "a" || k === "b" || k === "c" || k === "d" || k === "e") return k;
  return "neutral" as const;
}

export function partyTone(p: string) {
  if (p === "REP") return "r" as const;
  if (p === "DEM") return "dparty" as const;
  return "n" as const;
}

import type { Voter } from "./types";

export type TurnoutTier = "likely" | "dropoff" | "unlikely";

/**
 * Municipal turnout score from the master list.
 * Research (Bluebonnet, GoodParty, Bloomberg): vote history + age dominate.
 * This file only has LastVoted, not a full history, so recency of last vote
 * is the stand-in. For a Covington city race, a 2025/2026 local or special
 * is a much stronger signal than Nov 2024 presidential.
 */
export function turnoutScore(v: Pick<Voter, "lv" | "age" | "rd">): number {
  const lv = v.lv || "";
  const age = v.age;
  let s = 8;
  if (lv >= "2025") s = 72;
  else if (lv.startsWith("2024-11")) s = 48;
  else if (lv.slice(0, 4) >= "2022") s = 32;
  else if (lv.slice(0, 4) >= "2020") s = 22;
  else if (lv) s = 12;

  if (age != null) {
    if (age >= 65) s += 16;
    else if (age >= 50) s += 10;
    else if (age >= 35) s += 4;
    else if (age < 25) s -= 8;
  }
  if (!lv && (v.rd || "") >= "2024") s = Math.min(s, 22);
  return Math.max(0, Math.min(99, s));
}

export function turnoutTier(v: Pick<Voter, "lv" | "age" | "rd">): TurnoutTier {
  const s = turnoutScore(v);
  if (s >= 70) return "likely";
  if (s >= 40) return "dropoff";
  return "unlikely";
}

export const TURNOUT_LABEL: Record<TurnoutTier, string> = {
  likely: "Likely",
  dropoff: "Drop-off",
  unlikely: "Unlikely",
};

export const TURNOUT_BLURB: Record<TurnoutTier, string> = {
  likely: "Showed up for a 2025 or 2026 local/special — the municipal electorate.",
  dropoff: "Last vote was a presidential or older cycle. High ID value, GOTV risk.",
  unlikely: "No recent vote on file, or only very old history.",
};

export function isGotvTarget(v: Pick<Voter, "lv" | "age" | "rd">) {
  const t = turnoutTier(v);
  return t === "likely" || t === "dropoff";
}

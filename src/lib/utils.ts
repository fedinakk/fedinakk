import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, digits = 0): number {
  const p = 10 ** digits;
  return Math.round(value * p) / p;
}

/** Round MMR to the nearest 25 (one game's worth). */
export function roundMmr(value: number): number {
  return Math.max(0, Math.round(value / 25) * 25);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}

export function formatSigned(value: number): string {
  const s = formatNumber(Math.abs(value));
  return value >= 0 ? `+${s}` : `−${s}`;
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

/** Russian plural forms: plural(5, "матч", "матча", "матчей") */
export function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const d = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (d > 1 && d < 5) return few;
  if (d === 1) return one;
  return many;
}

const SHARE_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

/** URL-safe short id (no external deps). */
export function generateShareId(length = 10): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += SHARE_ALPHABET[b % SHARE_ALPHABET.length];
  return out;
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(mean(values.map((v) => (v - m) ** 2)));
}

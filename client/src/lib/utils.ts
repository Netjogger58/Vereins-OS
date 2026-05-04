import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d: string | Date, locale = "de-DE") {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateShort(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(dateStr: string, timeStr?: string | null) {
  const date = new Date(dateStr);
  const base = date.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short" });
  return timeStr ? `${base} · ${timeStr}` : base;
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.round(diff / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  if (sec < 60) return "gerade eben";
  if (min < 60) return `vor ${min} Min`;
  if (hr < 24) return `vor ${hr} Std`;
  if (day < 7) return `vor ${day} Tag${day === 1 ? "" : "en"}`;
  return formatDateShort(iso);
}

export function euro(n: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
}

export function initials(name: string) {
  return name
    .split(" ")
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function isoToday(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function addDaysIso(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

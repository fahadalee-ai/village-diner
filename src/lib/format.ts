export function money(n: number) {
  return Math.round(n * 100) / 100;
}

export function formatMoney(n: number) {
  return `$${money(n).toFixed(2)}`;
}

export function formatRange(min: number, max?: number) {
  if (max != null && max > min) return `${formatMoney(min)}–${formatMoney(max)}`;
  return formatMoney(min);
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function formatWhen(iso: string, now = Date.now()) {
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function isSameDay(iso: string, now = new Date()) {
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isPhone(value: string) {
  return value.replace(/\D/g, "").length >= 10;
}

/** 0–4. A score of 2 or more is accepted at registration. */
export function passwordScore(value: string) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

export function passwordLabel(score: number) {
  return ["Too short", "Weak", "Fair", "Good", "Strong"][score] ?? "Too short";
}

export function luhnOk(num: string) {
  const digits = num.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function cardBrand(num: string) {
  const d = num.replace(/\D/g, "");
  if (d.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(d) || /^2(2|7)/.test(d)) return "Mastercard";
  if (d.startsWith("34") || d.startsWith("37")) return "Amex";
  if (d.startsWith("6")) return "Discover";
  return "Card";
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "G";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function downloadIcs(opts: { title: string; start: Date; end: Date; details: string; location: string }) {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Village Diner//EN",
    "BEGIN:VEVENT",
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(opts.start)}`,
    `DTEND:${stamp(opts.end)}`,
    `SUMMARY:${opts.title}`,
    `DESCRIPTION:${opts.details.replace(/\n/g, " ")}`,
    `LOCATION:${opts.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "village-diner.ics";
  a.click();
  URL.revokeObjectURL(a.href);
}

export function shareOrCopy(title: string, text: string, url?: string) {
  if (typeof navigator !== "undefined" && navigator.share) {
    return navigator.share({ title, text, url }).catch(() => undefined);
  }
  const value = [title, text, url].filter(Boolean).join("\n");
  return navigator.clipboard?.writeText(value);
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function haptic(kind: "light" | "success" | "warn" = "light") {
  if (prefersReducedMotion()) return;
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(kind === "success" ? [12, 40, 16] : kind === "warn" ? [20, 30, 20] : 12);
  }
}

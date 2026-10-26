/**
 * Restaurant facts. Edit this file to update hours, tax, delivery, and contact
 * details without touching screens.
 */

export const business = {
  name: "The Village Diner",
  tagline: "A Classic Neighborhood Diner in Glenside",
  address: "299 N. Keswick Avenue, Glenside, PA 19038",
  street: "299 N. Keswick Avenue",
  city: "Glenside, PA 19038",
  phone: "215-886-9656",
  phoneTel: "+12158869656",
  email: "thevillagediner19038@gmail.com",
  website: "https://thevillagediner.org/",
  since: "September 2003",
  lat: 40.1064584,
  lon: -75.1474464,
  /** Pennsylvania state sales tax. Confirm before going live. */
  taxRate: 0.06,
  /** Shown only when delivery ordering is turned on. */
  deliveryFee: 4.95,
  /**
   * Delivery stays off until the restaurant confirms it.
   * Checkout copy explains that availability is still to be confirmed.
   * The in-app Settings switch can preview the delivery flow.
   */
  deliveryEnabled: false,
  version: "1.0.0",
  maintenanceMode: false,
  forceUpdate: false,
  /** Rewards earn rate. 1 point per $1 of the food subtotal. */
  pointsPerDollar: 1,
} as const;

/** Website social icons are present, but no profile URLs are published. Fill these in when the client provides them. */
export const socials: { id: string; label: string; url: string | null }[] = [
  { id: "instagram", label: "Instagram", url: null },
  { id: "facebook", label: "Facebook", url: null },
  { id: "x", label: "X", url: null },
  { id: "tiktok", label: "TikTok", url: null },
  { id: "youtube", label: "YouTube", url: null },
];

export type DayHours = {
  day: string;
  /** 24-hour "HH:MM", or null while hours are unpublished. */
  open: string | null;
  close: string | null;
};

/**
 * Hours are not published on the website. Leave open/close null to show
 * "Hours: TBD". When the client confirms hours, set open and close
 * (for example open: "07:00", close: "14:00") and the app will show
 * Open / Closed from the clock.
 */
export const weeklyHours: DayHours[] = [
  { day: "Sunday", open: null, close: null },
  { day: "Monday", open: null, close: null },
  { day: "Tuesday", open: null, close: null },
  { day: "Wednesday", open: null, close: null },
  { day: "Thursday", open: null, close: null },
  { day: "Friday", open: null, close: null },
  { day: "Saturday", open: null, close: null },
];

export const HOURS_LABEL = "Hours: TBD";

/**
 * Used only to limit "schedule for later" until real hours are published.
 * This is a placeholder breakfast-and-lunch window, not published hours.
 */
export const orderingWindow = { start: "07:00", end: "14:00" };

export function hoursArePublished() {
  return weeklyHours.some((day) => day.open && day.close);
}

export function todayHours(now = new Date()) {
  return weeklyHours[now.getDay()] ?? weeklyHours[0];
}

export type OpenStatus = "open" | "closed" | "tbd";

export function openStatus(now = new Date()): OpenStatus {
  if (!hoursArePublished()) return "tbd";
  const day = todayHours(now);
  if (!day.open || !day.close) return "closed";
  const [oh, om] = day.open.split(":").map(Number);
  const [ch, cm] = day.close.split(":").map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  const start = oh * 60 + om;
  const end = ch * 60 + cm;
  return mins >= start && mins < end ? "open" : "closed";
}

export function statusLabel(status: OpenStatus) {
  if (status === "open") return "Open";
  if (status === "closed") return "Closed";
  return "Hours TBD";
}

export const directionsUrl = `https://maps.apple.com/?ll=${business.lat},${business.lon}&q=${encodeURIComponent(
  `${business.name}, ${business.address}`,
)}`;

export const CONSUMER_ADVISORY =
  "Consumption of undercooked meat, poultry, eggs, or seafood may increase the risk of food-borne illnesses. Alert your server if you have special dietary requirements.";

export const ALLERGEN_DISCLAIMER = "Please confirm allergens with staff.";

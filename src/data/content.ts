import { business } from "./business";

export type DinerEvent = {
  id: string;
  name: string;
  /** ISO date (YYYY-MM-DD). Null when the date is still TBC. */
  date: string | null;
  dateLabel: string;
  startLabel: string;
  endLabel: string;
  /** 24-hour times used for calendar files. Ignored when date is null. */
  startTime: string;
  endTime: string;
  rainDate?: string;
  summary: string;
  description: string;
  location: string;
  image: string;
  gallery: string[];
  dateTbc?: boolean;
};

/**
 * Event copy from the Village Diner site. Dates live here so a conflicting
 * listing can be corrected in one place. Past events drop off the upcoming
 * list automatically. Set date to null and dateTbc to true to show "Date TBC".
 */
export const events: DinerEvent[] = [
  {
    id: "en-blanc",
    name: "Keswick Village Glenside en Blanc",
    date: "2026-10-01",
    dateLabel: "October 1, 2026",
    startLabel: "6:00 PM",
    endLabel: "9:00 PM",
    startTime: "18:00",
    endTime: "21:00",
    summary: "An elegant pop-up community dining experience where guests dress in white.",
    description:
      "An elegant pop-up community dining experience where guests dress in white for an evening of connection, food and atmosphere in Keswick Village. Stay tuned for updates and tickets.",
    location: "Keswick Village, Glenside",
    image: "en-blanc.jpg",
    gallery: ["en-blanc.jpg", "en-blanc-table.jpg", "en-blanc-evening.jpg"],
  },
  {
    id: "fall-festival",
    name: "Keswick Village Fall Festival",
    date: "2026-10-11",
    dateLabel: "Sunday, October 11, 2026",
    startLabel: "1:00 PM",
    endLabel: "6:00 PM",
    startTime: "13:00",
    endTime: "18:00",
    rainDate: "Rain date October 18, 2026",
    summary: "A seasonal street festival with local vendors, food, live entertainment, and kids' activities.",
    description:
      "A seasonal street festival celebrating fall with local vendors, food, live entertainment, kids' activities, and neighborhood fun throughout Keswick Village. Rain date October 18, 2026.",
    location: "Keswick Village, Glenside",
    image: "fall-festival.jpg",
    gallery: ["fall-festival.jpg", "fall-festival-street.jpg", "fall-festival-kids.jpg"],
  },
  {
    id: "christmas",
    name: "Christmas in Keswick",
    date: "2026-12-11",
    dateLabel: "Sunday, December 11, 2026",
    startLabel: "4:00 PM",
    endLabel: "7:00 PM",
    startTime: "16:00",
    endTime: "19:00",
    rainDate: "Rain date December 20, 2026",
    summary: "A festive holiday celebration with pop-up shops, photos with Santa, and village-wide cheer.",
    description:
      "A festive holiday celebration with pop-up shops, photos with Santa, entertainment, and village-wide cheer throughout Keswick Village. Rain date December 20, 2026.",
    location: "Keswick Village, Glenside",
    image: "christmas.jpg",
    gallery: ["christmas.jpg", "christmas-lights.jpg", "christmas-santa.jpg"],
  },
];

export function eventEnd(event: DinerEvent) {
  if (!event.date) return null;
  const [y, m, d] = event.date.split("-").map(Number);
  const [hh, mm] = event.endTime.split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 23, mm ?? 59);
}

export function isPastEvent(event: DinerEvent, now = new Date()) {
  if (event.dateTbc || !event.date) return false;
  const end = eventEnd(event);
  return !!end && end.getTime() < now.getTime();
}

export function upcomingEvents(now = new Date()) {
  return events.filter((event) => !isPastEvent(event, now));
}

export function archivedEvents(now = new Date()) {
  return events.filter((event) => isPastEvent(event, now));
}

export type Review = {
  id: string;
  name: string;
  quote: string;
  food: number;
  service: number;
  atmosphere: number;
  when: string;
};

export const reviews: Review[] = [
  {
    id: "ryan",
    name: "E. Ryan",
    quote: "So cute inside! The food and service are great!",
    food: 5,
    service: 5,
    atmosphere: 5,
    when: "1 week ago",
  },
  {
    id: "jason",
    name: "Jason Brooks",
    quote:
      "Went with a group of 6 and a service dog. The staff was extremely friendly. It was a great local joint. The food portions were a good size. I ordered the home fries (amazing) and the chipped beef gravy. So good, so filling, highly recommend this place.",
    food: 5,
    service: 5,
    atmosphere: 5,
    when: "4 weeks ago",
  },
  {
    id: "bryton",
    name: "Bryton Hawthorne",
    quote:
      "It's an old school diner that makes great breakfast, like the basic cheese egg omelette, pancakes, French toast, waffles, diner coffee etc. Everything is made with care; fresh ingredients, and the customer service is always friendly and attentive.",
    food: 5,
    service: 5,
    atmosphere: 5,
    when: "Recently",
  },
  {
    id: "steve",
    name: "steve",
    quote: "Great local diner for Breakfast or lunch. Pancakes are fluffy and delicious.",
    food: 5,
    service: 5,
    atmosphere: 5,
    when: "Recently",
  },
];

export const averageRating = 5;

export const story = {
  lead: "Since September 2003, The Village Diner has been a go-to spot for families, friends and neighbors, serving breakfast and lunch every day.",
  body: "Whether you're starting your morning with a fresh cup of coffee or stopping in for a relaxed midday meal, The Village Diner is all about good food, friendly service, and bringing the community together. We proudly serve breakfast and lunch every day — classic diner favorites, generous portions, and something for everyone at the table.",
  values: [
    { title: "Since September 2003", body: "A neighborhood constant on Keswick Avenue, still serving the same welcoming room." },
    { title: "Breakfast and lunch, every day", body: "From early eggs to a midday sandwich, the griddle stays busy seven days a week." },
    { title: "Made with care", body: "Fresh ingredients, familiar plates, and a staff that knows the regulars." },
  ],
};

export type RewardTier = { name: string; min: number; perk: string };

export const rewardTiers: RewardTier[] = [
  { name: "Neighbor", min: 0, perk: "Earn points on every order" },
  { name: "Regular", min: 150, perk: "Birthday treat and first look at specials" },
  { name: "Village VIP", min: 400, perk: "Exclusive offers and a free side each month" },
];

export type RewardOffer = {
  id: string;
  name: string;
  points: number;
  detail: string;
  /** Dollar value taken off an eligible order. */
  discount: number;
  minSubtotal?: number;
};

export const rewardCatalog: RewardOffer[] = [
  { id: "coffee", name: "Free coffee", points: 50, detail: "Any regular or decaf coffee.", discount: 3.5 },
  { id: "homefries", name: "Free side of home fries", points: 75, detail: "One side of homefries.", discount: 4.95 },
  { id: "off5", name: "$5 off your order", points: 120, detail: "Orders of $15 or more.", discount: 5, minSubtotal: 15 },
];

export type Coupon = {
  id: string;
  code: string;
  title: string;
  detail: string;
  expires: string;
  discount: number;
  minSubtotal?: number;
  dineInOnly?: boolean;
};

/** Sample app offers. Confirm rules with the restaurant before launch. */
export const coupons: Coupon[] = [
  {
    id: "village5",
    code: "VILLAGE5",
    title: "$5 off $25",
    detail: "Sample app offer. Confirm before promoting.",
    expires: "Dec 31, 2026",
    discount: 5,
    minSubtotal: 25,
  },
  {
    id: "wrap2",
    code: "NEWWRAP",
    title: "$2 off the Chicken Caesar Wrap",
    detail: "Sample offer for the new wrap. Confirm before promoting.",
    expires: "Dec 31, 2026",
    discount: 2,
    minSubtotal: 12,
  },
];

export const promos = [
  {
    id: "early-bird",
    eyebrow: "Dine-in only",
    title: "Early Bird Special",
    body: "2 eggs any style, homefries, toast and coffee or tea. Mon–Fri 8–9 AM.",
    price: "$6.75",
    image: "early-bird.jpg",
    target: "item" as const,
    itemId: "early-bird",
  },
  {
    id: "caesar-wrap",
    eyebrow: "New",
    title: "Try our NEW Chicken Caesar Wrap",
    body: "Grilled chicken, romaine, parmesan and Caesar dressing.",
    price: "$12.25",
    image: "chicken-caesar.jpg",
    target: "item" as const,
    itemId: "chicken-caesar-wrap",
  },
  {
    id: "rewards",
    eyebrow: "Village Rewards",
    title: "Join Rewards",
    body: "Earn points on every order and unlock a treat on your birthday.",
    price: `${business.pointsPerDollar} pt per $1`,
    image: "rewards.jpg",
    target: "rewards" as const,
    itemId: "",
  },
];

export type CateringTray = {
  id: string;
  category: string;
  itemId: string;
  serves: string;
  samplePrice: number;
};

/** Built from the regular menu. Prices are samples until catering is confirmed. */
export const cateringTrays: CateringTray[] = [
  { id: "bf-eggs", category: "Breakfast Trays", itemId: "two-eggs", serves: "Serves 8–10", samplePrice: 58 },
  { id: "bf-pancakes", category: "Breakfast Trays", itemId: "shortstack-pancakes", serves: "Serves 8–10", samplePrice: 54 },
  { id: "bf-toast", category: "Breakfast Trays", itemId: "texas-french-toast", serves: "Serves 8–10", samplePrice: 56 },
  { id: "bf-meat", category: "Breakfast Trays", itemId: "breakfast-meat", serves: "Serves 8–10", samplePrice: 36 },
  { id: "sw-club", category: "Sandwich and Wrap Platters", itemId: "triple-decker-club", serves: "Serves 8–10", samplePrice: 72 },
  { id: "sw-wrap", category: "Sandwich and Wrap Platters", itemId: "chicken-finger-wrap", serves: "Serves 8–10", samplePrice: 78 },
  { id: "sw-turkey", category: "Sandwich and Wrap Platters", itemId: "roasted-turkey", serves: "Serves 8–10", samplePrice: 68 },
  { id: "sa-caesar", category: "Salads", itemId: "caesar-salad", serves: "Serves 8–10", samplePrice: 48 },
  { id: "sa-chicken", category: "Salads", itemId: "chicken-salad-plate", serves: "Serves 8–10", samplePrice: 64 },
  { id: "sd-fries", category: "Sides", itemId: "homefries-or-grits", serves: "Serves 8–10", samplePrice: 28 },
  { id: "sd-ff", category: "Sides", itemId: "french-fries", serves: "Serves 8–10", samplePrice: 26 },
  { id: "bv-coffee", category: "Beverages", itemId: "coffee", serves: "Serves 10", samplePrice: 28 },
  { id: "bv-juice", category: "Beverages", itemId: "juice", serves: "Serves 10", samplePrice: 32 },
];

export const cateringCategories = ["Breakfast Trays", "Sandwich and Wrap Platters", "Salads", "Sides", "Beverages"];

export type CateringPackage = {
  id: string;
  name: string;
  guests: string;
  samplePrice: number;
  includes: string[];
  image: string;
};

export const cateringPackages: CateringPackage[] = [
  {
    id: "breakfast-package",
    name: "Breakfast Package",
    guests: "10–14 guests",
    samplePrice: 145,
    includes: ["Two Eggs tray", "Shortstack pancakes", "Breakfast meat", "Coffee and juice"],
    image: "breakfast-tray.jpg",
  },
  {
    id: "lunch-package",
    name: "Lunch Package",
    guests: "10–14 guests",
    samplePrice: 165,
    includes: ["Sandwich platter", "Chicken Caesar wraps", "Caesar salad", "Fountain drinks"],
    image: "sandwich-platter.jpg",
  },
  {
    id: "party-package",
    name: "Party Package",
    guests: "16–20 guests",
    samplePrice: 240,
    includes: ["Mixed sandwich and wrap platter", "Village fries", "Caesar salad", "Cinnamon buns", "Beverages"],
    image: "party-spread.jpg",
  },
];

export const partyTypes = ["Birthday", "Family gathering", "Corporate", "Community group"];

export const contactServices = ["General Question", "Order Issue", "Catering", "Events/Private Party", "Feedback"];

export const faqs = [
  {
    q: "What are your hours?",
    a: "Hours are not published on the website yet. The app shows Hours: TBD until the diner confirms them. Call 215-886-9656 and we'll tell you if the griddle is on.",
  },
  {
    q: "Can I order delivery?",
    a: "Pickup is available in the app. Delivery availability is still to be confirmed by the restaurant, so delivery stays off until then.",
  },
  {
    q: "Is the Early Bird Special available for pickup?",
    a: "No. The Early Bird Special is dine-in only, Monday through Friday, 8:00–9:00 AM. It is listed so you can see it, and it cannot be added to a pickup order.",
  },
  {
    q: "Who is a kids' meal for?",
    a: "Kid's breakfast and kid's lunch are for guests 12 and under. Each one includes a small milk, chocolate milk, juice, or fountain drink.",
  },
  {
    q: "How do allergens work?",
    a: "Tags on each item are a guide, not a guarantee. Please confirm allergens with staff before you order, especially for fryer items and the soup of the day.",
  },
  {
    q: "How do rewards work?",
    a: "You earn 1 point per $1 spent on food. Points can be redeemed for a coffee, a side of home fries, or $5 off an eligible order. The earn rate and rewards can be edited before launch.",
  },
  {
    q: "Do you cater?",
    a: "The website still says catering is coming soon. You can browse sample trays and packages and request a custom quote. Sample prices are not final.",
  },
  {
    q: "Can I book a private party?",
    a: "Yes. Send a request with the date, guest count, and what you're celebrating. The diner will follow up by phone or email.",
  },
];

export const privacyPolicy = [
  `This policy describes how the ${business.name} app handles information. It is a draft for the restaurant to review with counsel before launch.`,
  "Information you provide includes your name, email, mobile number, birthday (to time a birthday offer), order details, and any addresses or payment labels you save. Payment card numbers are not stored in this preview; a live app should use a payment processor and keep only a token and last four digits.",
  "Orders, favorites, and rewards in this preview stay on your device. A production app would store them on the diner's ordering system so the kitchen can see the ticket.",
  "We use your birthday month only for the birthday offer. Promotional email and notifications are sent only if you opt in, and you can turn each type off in Settings.",
  "Location is used only after you allow it, to help with directions and a future delivery address. You can deny location and still order pickup.",
  `Questions: ${business.email} or ${business.phone}. ${business.address}.`,
];

export const termsOfService = [
  `These terms cover use of the ${business.name} ordering app. They are a draft for the restaurant to review before launch.`,
  "Menu prices in the app match the prices supplied for this build. The Early Bird Special is dine-in only and is not a pickup item. Items can sell out, and the kitchen may confirm substitutions.",
  "Pickup times are estimates. Scheduled orders can be placed inside the placeholder ordering window until published hours are confirmed.",
  "Rewards points, coupons, and catering prices marked Sample are configurable and are not a final offer until the diner approves them.",
  "Allergen tags are indicative. You are responsible for confirming allergens with staff if you have an allergy.",
  "The diner may refuse or cancel an order that cannot be prepared safely. For questions, call the restaurant before you come in.",
];

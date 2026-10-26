import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { business } from "@/data/business";
import { coupons, rewardCatalog } from "@/data/content";
import { readStorage, writeStorage } from "./storage";
import { formatWhen, initials, money } from "./format";

export type ThemeMode = "system" | "light" | "dark";
export type OrderMode = "pickup" | "delivery";
export type OrderStatus = "received" | "preparing" | "ready" | "delivering" | "completed";

export type PointsRow = { id: string; label: string; points: number; at: string };

export type DinerUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  birthday?: string;
  promoOptIn: boolean;
  guest?: boolean;
  avatarText: string;
  avatarUrl?: string;
  points: number;
  pointsHistory: PointsRow[];
};

export type CartLine = {
  id: string;
  itemId: string;
  name: string;
  image: string;
  qty: number;
  unitPrice: number;
  optionsLabel: string;
  instructions: string;
  selection: Record<string, string[]>;
};

export type SavedAddress = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
};

export type SavedCard = { id: string; brand: string; last4: string; exp: string };

export type DinerOrder = {
  id: string;
  number: string;
  userId: string;
  createdAt: string;
  status: OrderStatus;
  type: OrderMode;
  whenLabel: string;
  lines: CartLine[];
  subtotal: number;
  discount: number;
  tax: number;
  tip: number;
  fee: number;
  total: number;
  contact: { name: string; phone: string; email: string };
  address?: string;
  paymentLabel: string;
  promo?: string;
  rewardId?: string;
};

export type AppNotice = {
  id: string;
  kind: "order" | "status" | "special" | "menu" | "reward" | "event";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  screen: string;
  params?: Record<string, string>;
};

export type NotifPrefs = {
  orders: boolean;
  specials: boolean;
  menu: boolean;
  rewards: boolean;
  events: boolean;
};

export type Toast = { id: number; title: string; body?: string };

type Persisted = {
  onboarded: boolean;
  users: DinerUser[];
  user: DinerUser | null;
  cart: CartLine[];
  orders: DinerOrder[];
  favorites: string[];
  addresses: SavedAddress[];
  cards: SavedCard[];
  notices: AppNotice[];
  prefs: NotifPrefs;
  theme: ThemeMode;
  orderMode: OrderMode;
  deliveryPreview: boolean;
  promoCode: string | null;
  rewardId: string | null;
  tipChoice: "10" | "15" | "20" | "custom";
  customTip: string;
  notifPermission: "unknown" | "granted" | "denied";
  locationPermission: "unknown" | "granted" | "denied";
};

const DEFAULT_PREFS: NotifPrefs = {
  orders: true,
  specials: true,
  menu: true,
  rewards: true,
  events: true,
};

function seedNotices(): AppNotice[] {
  const now = Date.now();
  return [
    {
      id: "n-welcome",
      kind: "reward",
      title: "Welcome to Village Rewards",
      body: "Earn 1 point per $1 on every pickup order.",
      createdAt: new Date(now - 1000 * 60 * 40).toISOString(),
      read: false,
      screen: "rewards",
    },
    {
      id: "n-wrap",
      kind: "menu",
      title: "NEW: Chicken Caesar Wrap",
      body: "Grilled chicken, romaine, parmesan and Caesar dressing. $12.25.",
      createdAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
      read: false,
      screen: "item",
      params: { id: "chicken-caesar-wrap" },
    },
    {
      id: "n-early",
      kind: "special",
      title: "Early Bird, weekday mornings",
      body: "2 eggs, homefries, toast and coffee or tea for $6.75. Dine-in only, Mon–Fri 8–9 AM.",
      createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
      read: true,
      screen: "item",
      params: { id: "early-bird" },
    },
    {
      id: "n-event",
      kind: "event",
      title: "Christmas in Keswick",
      body: "Sunday, December 11, 2026, 4:00–7:00 PM. Rain date December 20.",
      createdAt: new Date(now - 1000 * 60 * 60 * 50).toISOString(),
      read: true,
      screen: "event",
      params: { id: "christmas" },
    },
  ];
}

export const previewUser = (): DinerUser => ({
  id: "alex",
  name: "Alex Rivera",
  email: "alex@email.com",
  phone: "215-555-0199",
  password: "Diner123",
  birthday: "1994-10-08",
  promoOptIn: true,
  avatarText: "AR",
  points: 80,
  pointsHistory: [
    { id: "ph1", label: "Order VD-2041", points: 18, at: new Date(Date.now() - 86400000 * 6).toISOString() },
    { id: "ph2", label: "Welcome bonus", points: 25, at: new Date(Date.now() - 86400000 * 20).toISOString() },
    { id: "ph3", label: "Order VD-1988", points: 37, at: new Date(Date.now() - 86400000 * 28).toISOString() },
  ],
});

function blank(partial: Partial<Persisted>): Persisted {
  return {
    onboarded: false,
    users: [previewUser()],
    user: null,
    cart: [],
    orders: [],
    favorites: [],
    addresses: [],
    cards: [],
    notices: seedNotices(),
    prefs: DEFAULT_PREFS,
    theme: "system",
    orderMode: "pickup",
    deliveryPreview: false,
    promoCode: null,
    rewardId: null,
    tipChoice: "15",
    customTip: "",
    notifPermission: "unknown",
    locationPermission: "unknown",
    ...partial,
  };
}

function loadPersisted(): Persisted | null {
  const raw = readStorage("state");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Persisted;
    if (!parsed.users?.some((u) => u.email === "alex@email.com")) {
      parsed.users = [...(parsed.users ?? []), previewUser()];
    }
    return parsed;
  } catch {
    return null;
  }
}

function statusFor(order: DinerOrder, now = Date.now()): OrderStatus {
  if (order.status === "completed") return "completed";
  const age = now - new Date(order.createdAt).getTime();
  if (age > 50_000) return "completed";
  if (age > 32_000) return order.type === "delivery" ? "delivering" : "ready";
  if (age > 14_000) return "preparing";
  return "received";
}

const statusCopy: Record<OrderStatus, string> = {
  received: "We received your order.",
  preparing: "The kitchen is preparing your order.",
  ready: "Your order is ready for pickup.",
  delivering: "Your order is out for delivery.",
  completed: "Your order is complete. Enjoy.",
};

type Store = Persisted & {
  hydrated: boolean;
  toasts: Toast[];
  unread: number;
  cartCount: number;
  deliveryAvailable: boolean;
  pushToast: (title: string, body?: string) => void;
  dismissToast: (id: number) => void;
  markOnboarded: () => void;
  login: (email: string, password: string) => { ok: true } | { ok: false; reason: string };
  register: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    birthday?: string;
    promoOptIn: boolean;
  }) => { ok: true } | { ok: false; reason: string };
  continueAsGuest: () => void;
  logout: () => void;
  deleteAccount: () => void;
  updateUser: (patch: Partial<DinerUser>) => void;
  resetPassword: (email: string, password: string) => boolean;
  setTheme: (theme: ThemeMode) => void;
  setOrderMode: (mode: OrderMode) => void;
  setDeliveryPreview: (on: boolean) => void;
  toggleFavorite: (itemId: string) => void;
  addLine: (line: Omit<CartLine, "id">) => void;
  updateLine: (id: string, patch: Partial<CartLine>) => void;
  removeLine: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  applyPromo: (code: string) => { ok: true; title: string } | { ok: false; reason: string };
  clearPromo: () => void;
  applyReward: (id: string) => { ok: true } | { ok: false; reason: string };
  clearReward: () => void;
  setTipChoice: (choice: Persisted["tipChoice"]) => void;
  setCustomTip: (value: string) => void;
  placeOrder: (input: {
    type: OrderMode;
    whenLabel: string;
    contact: DinerOrder["contact"];
    address?: string;
    paymentLabel: string;
    tip: number;
    discount: number;
    fee: number;
  }) => DinerOrder;
  reorder: (orderId: string) => void;
  saveAddress: (address: SavedAddress) => void;
  removeAddress: (id: string) => void;
  saveCard: (card: SavedCard) => void;
  removeCard: (id: string) => void;
  markNotice: (id: string) => void;
  markAllNotices: () => void;
  togglePref: (key: keyof NotifPrefs) => void;
  setNotifPermission: (value: Persisted["notifPermission"]) => void;
  setLocationPermission: (value: Persisted["locationPermission"]) => void;
  notify: (notice: Omit<AppNotice, "id" | "createdAt" | "read">) => void;
};

const Ctx = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(() => blank({}));
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const saved = loadPersisted();
    if (saved) setState(blank(saved));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage("state", JSON.stringify(state));
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const id = window.setInterval(() => {
      setState((prev) => {
        let changed = false;
        const orders = prev.orders.map((order) => {
          const next = statusFor(order);
          if (next !== order.status) {
            changed = true;
            return { ...order, status: next };
          }
          return order;
        });
        if (!changed) return prev;
        const notices = [...prev.notices];
        orders.forEach((order, index) => {
          if (order.status === prev.orders[index]?.status) return;
          if (!prev.prefs.orders) return;
          notices.unshift({
            id: `st-${order.id}-${order.status}`,
            kind: "status",
            title: `Order ${order.number}`,
            body: statusCopy[order.status],
            createdAt: new Date().toISOString(),
            read: false,
            screen: "track",
            params: { id: order.id },
          });
        });
        return { ...prev, orders, notices };
      });
    }, 4000);
    return () => window.clearInterval(id);
  }, [hydrated]);

  const api = useMemo<Store>(() => {
    const pushToast = (title: string, body?: string) => {
      const id = Date.now() + Math.random();
      setToasts((list) => [...list, { id, title, body }]);
      window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200);
    };

    const patchUser = (user: DinerUser) => {
      setState((prev) => ({
        ...prev,
        user,
        users: prev.users.some((u) => u.id === user.id) ? prev.users.map((u) => (u.id === user.id ? user : u)) : [...prev.users, user],
      }));
    };

    return {
      ...state,
      hydrated,
      toasts,
      unread: state.notices.filter((n) => !n.read).length,
      cartCount: state.cart.reduce((sum, line) => sum + line.qty, 0),
      deliveryAvailable: business.deliveryEnabled || state.deliveryPreview,
      pushToast,
      dismissToast: (id) => setToasts((list) => list.filter((t) => t.id !== id)),
      markOnboarded: () => setState((prev) => ({ ...prev, onboarded: true })),
      login: (email, password) => {
        const found = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!found || found.password !== password) return { ok: false, reason: "That email and password don't match." };
        setState((prev) => ({
          ...prev,
          user: found,
          onboarded: true,
          favorites: found.id === "alex" && prev.favorites.length === 0 ? ["texas-french-toast", "cheese-burger"] : prev.favorites,
          addresses:
            found.id === "alex" && prev.addresses.length === 0
              ? [{ id: "home-alex", label: "Home", line1: "18 S. Easton Road", city: "Glenside", state: "PA", zip: "19038", isDefault: true }]
              : prev.addresses,
          cards: found.id === "alex" && prev.cards.length === 0 ? [{ id: "visa-alex", brand: "Visa", last4: "4242", exp: "08/28" }] : prev.cards,
        }));
        return { ok: true };
      },
      register: (input) => {
        if (state.users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
          return { ok: false, reason: "An account with that email already exists." };
        }
        const created: DinerUser = {
          id: `u${Date.now()}`,
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          phone: input.phone.trim(),
          password: input.password,
          birthday: input.birthday,
          promoOptIn: input.promoOptIn,
          avatarText: initials(input.name),
          points: 0,
          pointsHistory: [],
        };
        setState((prev) => ({ ...prev, users: [...prev.users, created], user: created, onboarded: true }));
        return { ok: true };
      },
      continueAsGuest: () => {
        const guest: DinerUser = {
          id: `g${Date.now()}`,
          name: "Guest",
          email: "",
          phone: "",
          guest: true,
          promoOptIn: false,
          avatarText: "G",
          points: 0,
          pointsHistory: [],
        };
        setState((prev) => ({ ...prev, user: guest, onboarded: true }));
      },
      logout: () => setState((prev) => ({ ...prev, user: null, cart: [], promoCode: null, rewardId: null })),
      deleteAccount: () =>
        setState((prev) => ({
          ...prev,
          users: prev.user ? prev.users.filter((u) => u.id !== prev.user?.id) : prev.users,
          user: null,
          cart: [],
          orders: prev.user ? prev.orders.filter((o) => o.userId !== prev.user?.id) : prev.orders,
          favorites: [],
          addresses: [],
          cards: [],
          promoCode: null,
          rewardId: null,
        })),
      updateUser: (patch) => {
        if (!state.user) return;
        patchUser({ ...state.user, ...patch, avatarText: patch.name ? initials(patch.name) : state.user.avatarText });
      },
      resetPassword: (email, password) => {
        const found = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!found) return false;
        const next = { ...found, password };
        setState((prev) => ({
          ...prev,
          users: prev.users.map((u) => (u.id === found.id ? next : u)),
          user: prev.user?.id === found.id ? next : prev.user,
        }));
        return true;
      },
      setTheme: (theme) => setState((prev) => ({ ...prev, theme })),
      setOrderMode: (orderMode) => setState((prev) => ({ ...prev, orderMode })),
      setDeliveryPreview: (deliveryPreview) =>
        setState((prev) => ({ ...prev, deliveryPreview, orderMode: deliveryPreview ? prev.orderMode : "pickup" })),
      toggleFavorite: (itemId) =>
        setState((prev) => ({
          ...prev,
          favorites: prev.favorites.includes(itemId) ? prev.favorites.filter((id) => id !== itemId) : [itemId, ...prev.favorites],
        })),
      addLine: (line) =>
        setState((prev) => {
          const existing = prev.cart.find(
            (l) => l.itemId === line.itemId && l.optionsLabel === line.optionsLabel && l.instructions === line.instructions,
          );
          if (existing) {
            return {
              ...prev,
              cart: prev.cart.map((l) => (l.id === existing.id ? { ...l, qty: l.qty + line.qty } : l)),
            };
          }
          return { ...prev, cart: [...prev.cart, { ...line, id: `c${Date.now()}` }] };
        }),
      updateLine: (id, patch) =>
        setState((prev) => ({ ...prev, cart: prev.cart.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
      removeLine: (id) => setState((prev) => ({ ...prev, cart: prev.cart.filter((l) => l.id !== id) })),
      setQty: (id, qty) =>
        setState((prev) => ({
          ...prev,
          cart: qty <= 0 ? prev.cart.filter((l) => l.id !== id) : prev.cart.map((l) => (l.id === id ? { ...l, qty } : l)),
        })),
      clearCart: () => setState((prev) => ({ ...prev, cart: [], promoCode: null, rewardId: null })),
      applyPromo: (code) => {
        const found = coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
        if (!found) return { ok: false, reason: "That code isn't active." };
        if (found.dineInOnly) return { ok: false, reason: "That offer is dine-in only." };
        setState((prev) => ({ ...prev, promoCode: found.code, rewardId: null }));
        return { ok: true, title: found.title };
      },
      clearPromo: () => setState((prev) => ({ ...prev, promoCode: null })),
      applyReward: (id) => {
        const reward = rewardCatalog.find((r) => r.id === id);
        if (!reward) return { ok: false, reason: "That reward isn't available." };
        if (!state.user || state.user.guest) return { ok: false, reason: "Sign in to redeem points." };
        if (state.user.points < reward.points) return { ok: false, reason: "You need more points for this reward." };
        setState((prev) => ({ ...prev, rewardId: id, promoCode: null }));
        return { ok: true };
      },
      clearReward: () => setState((prev) => ({ ...prev, rewardId: null })),
      setTipChoice: (tipChoice) => setState((prev) => ({ ...prev, tipChoice })),
      setCustomTip: (customTip) => setState((prev) => ({ ...prev, customTip })),
      placeOrder: (input) => {
        const subtotal = money(state.cart.reduce((sum, line) => sum + line.unitPrice * line.qty, 0));
        const tax = money(Math.max(0, subtotal - input.discount) * business.taxRate);
        const total = money(Math.max(0, subtotal - input.discount) + tax + input.tip + input.fee);
        const order: DinerOrder = {
          id: `o${Date.now()}`,
          number: `VD-${Math.floor(1000 + Math.random() * 9000)}`,
          userId: state.user?.id ?? "guest",
          createdAt: new Date().toISOString(),
          status: "received",
          type: input.type,
          whenLabel: input.whenLabel,
          lines: state.cart,
          subtotal,
          discount: input.discount,
          tax,
          tip: input.tip,
          fee: input.fee,
          total,
          contact: input.contact,
          address: input.address,
          paymentLabel: input.paymentLabel,
          promo: state.promoCode ?? undefined,
          rewardId: state.rewardId ?? undefined,
        };
        const earned = Math.floor(subtotal);
        setState((prev) => {
          let user = prev.user;
          if (user && !user.guest) {
            const spent = prev.rewardId ? (rewardCatalog.find((r) => r.id === prev.rewardId)?.points ?? 0) : 0;
            user = {
              ...user,
              points: Math.max(0, user.points - spent) + earned,
              pointsHistory: [
                { id: `ph${Date.now()}`, label: `Order ${order.number}`, points: earned, at: order.createdAt },
                ...(spent ? [{ id: `ph${Date.now()}-r`, label: "Reward redeemed", points: -spent, at: order.createdAt }] : []),
                ...user.pointsHistory,
              ],
            };
          }
          const notices = prev.prefs.orders
            ? [
                {
                  id: `ord-${order.id}`,
                  kind: "order" as const,
                  title: `Order ${order.number} confirmed`,
                  body: `${input.whenLabel}. A receipt was sent to ${input.contact.email || "your email"}.`,
                  createdAt: order.createdAt,
                  read: false,
                  screen: "track",
                  params: { id: order.id },
                },
                ...prev.notices,
              ]
            : prev.notices;
          return {
            ...prev,
            user,
            users: user && !user.guest ? prev.users.map((u) => (u.id === user!.id ? user! : u)) : prev.users,
            orders: [order, ...prev.orders],
            cart: [],
            promoCode: null,
            rewardId: null,
            notices,
          };
        });
        return order;
      },
      reorder: (orderId) => {
        const order = state.orders.find((o) => o.id === orderId);
        if (!order) return;
        setState((prev) => ({
          ...prev,
          cart: order.lines.map((line) => ({ ...line, id: `c${Date.now()}${line.id}` })),
        }));
      },
      saveAddress: (address) =>
        setState((prev) => {
          const list = prev.addresses.some((a) => a.id === address.id)
            ? prev.addresses.map((a) => (a.id === address.id ? address : a))
            : [...prev.addresses, address];
          const next = address.isDefault ? list.map((a) => ({ ...a, isDefault: a.id === address.id })) : list;
          return { ...prev, addresses: next };
        }),
      removeAddress: (id) => setState((prev) => ({ ...prev, addresses: prev.addresses.filter((a) => a.id !== id) })),
      saveCard: (card) =>
        setState((prev) => ({
          ...prev,
          cards: prev.cards.some((c) => c.id === card.id) ? prev.cards.map((c) => (c.id === card.id ? card : c)) : [...prev.cards, card],
        })),
      removeCard: (id) => setState((prev) => ({ ...prev, cards: prev.cards.filter((c) => c.id !== id) })),
      markNotice: (id) => setState((prev) => ({ ...prev, notices: prev.notices.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllNotices: () => setState((prev) => ({ ...prev, notices: prev.notices.map((n) => ({ ...n, read: true })) })),
      togglePref: (key) => setState((prev) => ({ ...prev, prefs: { ...prev.prefs, [key]: !prev.prefs[key] } })),
      setNotifPermission: (notifPermission) => setState((prev) => ({ ...prev, notifPermission })),
      setLocationPermission: (locationPermission) => setState((prev) => ({ ...prev, locationPermission })),
      notify: (notice) =>
        setState((prev) => ({
          ...prev,
          notices: [{ ...notice, id: `n${Date.now()}`, createdAt: new Date().toISOString(), read: false }, ...prev.notices],
        })),
    };
  }, [state, hydrated, toasts]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function noticeTime(iso: string) {
  return formatWhen(iso);
}
